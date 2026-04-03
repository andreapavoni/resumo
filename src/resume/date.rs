use std::cmp::Ordering;
use std::fmt;
use std::str::FromStr;

use chrono::{Datelike, NaiveDate};

use crate::i18n::Translations;
use serde::{Deserialize, Deserializer, Serialize, Serializer};

/// Error returned when a date string cannot be parsed into a [`ResumeDate`].
#[derive(Debug, thiserror::Error)]
pub enum DateParseError {
    /// The string does not have a recognisable structure (`"YYYY-MM"` or `"YYYY-MM-DD"`).
    #[error("invalid date format: {0:?}")]
    InvalidFormat(String),
    /// The string has the right structure but contains out-of-range values
    /// (e.g. month 13, or a day that doesn't exist in that month).
    #[error("invalid date: {0:?}")]
    InvalidDate(String),
}

/// A date as used in the JSON Resume schema.
///
/// Deserializes from `"YYYY-MM"` or `"YYYY-MM-DD"`. Month-precision inputs
/// (`"YYYY-MM"`) store day=1 internally.
///
/// - [`Self::as_start`] returns the date as the beginning of its period (day=1 for month-precision).
/// - [`Self::as_end`] returns the date as the end of its period (last day of month for month-precision).
///
/// Serializes back to `"YYYY-MM"` or `"YYYY-MM-DD"` preserving original precision.
/// Displays as `"Nov 2024"` for human-readable output.
#[derive(Debug, Clone)]
pub struct ResumeDate {
    date: NaiveDate,
    month_precision: bool,
}

impl ResumeDate {
    /// Creates a month-precision date (day stored as 1 internally).
    /// Returns `None` if `month` is outside `1..=12` or `year` is 0.
    pub fn new(year: u16, month: u8) -> Option<Self> {
        NaiveDate::from_ymd_opt(year as i32, month as u32, 1).map(|date| Self {
            date,
            month_precision: true,
        })
    }

    pub fn year(&self) -> u16 {
        self.date.year() as u16
    }

    pub fn month(&self) -> u8 {
        self.date.month() as u8
    }

    /// The effective start of this date's period.
    /// Month-precision dates return the first of the month (which is how they are stored).
    /// Day-precision dates return the exact date.
    pub fn as_start(&self) -> NaiveDate {
        self.date
    }

    /// The effective end of this date's period.
    /// Month-precision dates return the last day of the month.
    /// Day-precision dates return the exact date.
    pub fn as_end(&self) -> NaiveDate {
        if self.month_precision {
            last_day_of_month(self.date)
        } else {
            self.date
        }
    }

    /// Returns the wire format string for JSON serialization, preserving input precision.
    pub fn to_string(&self) -> String {
        if self.month_precision {
            self.date.format("%Y-%m").to_string()
        } else {
            self.date.format("%Y-%m-%d").to_string()
        }
    }
}

fn last_day_of_month(date: NaiveDate) -> NaiveDate {
    let (year, month) = (date.year(), date.month());
    let first_of_next = if month == 12 {
        NaiveDate::from_ymd_opt(year + 1, 1, 1)
    } else {
        NaiveDate::from_ymd_opt(year, month + 1, 1)
    };
    first_of_next.and_then(|d| d.pred_opt()).unwrap_or(date)
}

impl ResumeDate {
    /// Formats the date using the localized month abbreviation from `t`.
    pub fn format_localized(&self, t: &Translations) -> String {
        let month_name = t.months[(self.date.month() - 1) as usize];
        format!("{} {}", month_name, self.date.year())
    }
}

impl fmt::Display for ResumeDate {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.date.format("%b %Y"))
    }
}

impl FromStr for ResumeDate {
    type Err = DateParseError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let parts: Vec<&str> = s.split('-').collect();
        match parts.len() {
            2 => {
                let year: i32 = parts[0]
                    .parse()
                    .map_err(|_| DateParseError::InvalidFormat(s.to_string()))?;
                let month: u32 = parts[1]
                    .parse()
                    .map_err(|_| DateParseError::InvalidFormat(s.to_string()))?;
                NaiveDate::from_ymd_opt(year, month, 1)
                    .map(|date| Self {
                        date,
                        month_precision: true,
                    })
                    .ok_or_else(|| DateParseError::InvalidDate(s.to_string()))
            }
            3 => NaiveDate::parse_from_str(s, "%Y-%m-%d")
                .map(|date| Self {
                    date,
                    month_precision: false,
                })
                .map_err(|_| DateParseError::InvalidDate(s.to_string())),
            _ => Err(DateParseError::InvalidFormat(s.to_string())),
        }
    }
}

impl PartialEq for ResumeDate {
    fn eq(&self, other: &Self) -> bool {
        self.date == other.date
    }
}

impl Eq for ResumeDate {}

impl PartialOrd for ResumeDate {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for ResumeDate {
    fn cmp(&self, other: &Self) -> Ordering {
        self.date.cmp(&other.date)
    }
}

impl Serialize for ResumeDate {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.to_string())
    }
}

impl<'de> Deserialize<'de> for ResumeDate {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let s = String::deserialize(deserializer)?;
        s.parse().map_err(serde::de::Error::custom)
    }
}

/// Lenient deserializer for `Option<ResumeDate>` fields in the data model.
///
/// Unlike the standard `Option<ResumeDate>` deserialization, invalid date strings
/// (e.g. `"2026"` instead of `"2026-01"`) are silently converted to `None` rather
/// than rejecting the whole request with a 422. This means a broken import still
/// produces a preview — just with the offending date missing — instead of a silent
/// failure in the UI.
///
/// Apply with `#[serde(deserialize_with = "super::date::deserialize_optional")]`.
pub fn deserialize_optional<'de, D>(deserializer: D) -> Result<Option<ResumeDate>, D::Error>
where
    D: Deserializer<'de>,
{
    let opt: Option<String> = Option::deserialize(deserializer)?;
    Ok(opt.and_then(|s| s.parse().ok()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_yyyy_mm() {
        let d: ResumeDate = "2024-11".parse().unwrap();
        assert_eq!(d.year(), 2024);
        assert_eq!(d.month(), 11);
        assert!(d.month_precision);
    }

    #[test]
    fn parse_yyyy_mm_dd() {
        let d: ResumeDate = "2024-11-15".parse().unwrap();
        assert_eq!(d.year(), 2024);
        assert_eq!(d.month(), 11);
        assert!(!d.month_precision);
    }

    #[test]
    fn as_start_returns_first_of_month_for_month_precision() {
        let d: ResumeDate = "2024-06".parse().unwrap();
        assert_eq!(d.as_start(), NaiveDate::from_ymd_opt(2024, 6, 1).unwrap());
    }

    #[test]
    fn as_end_returns_last_day_of_month() {
        assert_eq!(
            "2024-01".parse::<ResumeDate>().unwrap().as_end(),
            NaiveDate::from_ymd_opt(2024, 1, 31).unwrap()
        );
        assert_eq!(
            "2024-02".parse::<ResumeDate>().unwrap().as_end(),
            NaiveDate::from_ymd_opt(2024, 2, 29).unwrap() // 2024 is a leap year
        );
        assert_eq!(
            "2023-02".parse::<ResumeDate>().unwrap().as_end(),
            NaiveDate::from_ymd_opt(2023, 2, 28).unwrap() // 2023 is not
        );
        assert_eq!(
            "2024-12".parse::<ResumeDate>().unwrap().as_end(),
            NaiveDate::from_ymd_opt(2024, 12, 31).unwrap()
        );
    }

    #[test]
    fn as_end_returns_exact_date_for_day_precision() {
        let d: ResumeDate = "2024-06-15".parse().unwrap();
        assert_eq!(d.as_end(), NaiveDate::from_ymd_opt(2024, 6, 15).unwrap());
    }

    #[test]
    fn display_format() {
        let d = ResumeDate::new(2024, 11).unwrap();
        assert_eq!(format!("{d}"), "Nov 2024");
    }

    #[test]
    fn wire_format_month_precision() {
        let d = ResumeDate::new(2024, 3).unwrap();
        assert_eq!(d.to_string(), "2024-03");
    }

    #[test]
    fn wire_format_day_precision() {
        let d: ResumeDate = "2024-03-15".parse().unwrap();
        assert_eq!(d.to_string(), "2024-03-15");
    }

    #[test]
    fn ordering() {
        let a = ResumeDate::new(2020, 6).unwrap();
        let b = ResumeDate::new(2022, 1).unwrap();
        let c = ResumeDate::new(2022, 3).unwrap();
        assert!(a < b);
        assert!(b < c);
    }

    #[test]
    fn serde_roundtrip_month_precision() {
        let d = ResumeDate::new(2024, 11).unwrap();
        let json = serde_json::to_string(&d).unwrap();
        assert_eq!(json, r#""2024-11""#);
        let parsed: ResumeDate = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed, d);
    }

    #[test]
    fn serde_roundtrip_day_precision() {
        let json = r#""2024-11-15""#;
        let d: ResumeDate = serde_json::from_str(json).unwrap();
        assert_eq!(d.to_string(), "2024-11-15");
        let back = serde_json::to_string(&d).unwrap();
        assert_eq!(back, json);
    }

    #[test]
    fn none_sorts_before_some() {
        let none: Option<ResumeDate> = None;
        let some = Some(ResumeDate::new(2020, 1).unwrap());
        assert!(none < some);
    }
}
