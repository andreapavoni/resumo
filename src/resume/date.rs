use std::fmt;
use std::str::FromStr;

use serde::{Deserialize, Deserializer, Serialize, Serializer};

/// A year-month date as used in the JSON Resume schema.
///
/// Serializes to `"YYYY-MM"` and deserializes from `"YYYY-MM"` or `"YYYY-MM-DD"`.
/// Displays as `"Nov 2024"` for human-readable output.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct ResumeDate {
    pub year: u16,
    pub month: u8,
}

const MONTH_NAMES: [&str; 12] = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

impl ResumeDate {
    pub fn new(year: u16, month: u8) -> Option<Self> {
        if (1..=12).contains(&month) && year > 0 {
            Some(Self { year, month })
        } else {
            None
        }
    }

    /// Returns the `"YYYY-MM"` wire format for JSON serialization.
    pub fn to_wire_format(&self) -> String {
        format!("{:04}-{:02}", self.year, self.month)
    }
}

impl fmt::Display for ResumeDate {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let month_name = MONTH_NAMES
            .get((self.month - 1) as usize)
            .unwrap_or(&"???");
        write!(f, "{} {}", month_name, self.year)
    }
}

impl FromStr for ResumeDate {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // Accept "YYYY-MM" or "YYYY-MM-DD"
        let parts: Vec<&str> = s.split('-').collect();
        if parts.len() < 2 {
            return Err(format!("invalid date format: {s}"));
        }
        let year: u16 = parts[0]
            .parse()
            .map_err(|_| format!("invalid year: {}", parts[0]))?;
        let month: u8 = parts[1]
            .parse()
            .map_err(|_| format!("invalid month: {}", parts[1]))?;
        ResumeDate::new(year, month).ok_or_else(|| format!("date out of range: {s}"))
    }
}

impl Serialize for ResumeDate {
    fn serialize<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.to_wire_format())
    }
}

impl<'de> Deserialize<'de> for ResumeDate {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let s = String::deserialize(deserializer)?;
        ResumeDate::from_str(&s).map_err(serde::de::Error::custom)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_yyyy_mm() {
        let d: ResumeDate = "2024-11".parse().unwrap();
        assert_eq!(d.year, 2024);
        assert_eq!(d.month, 11);
    }

    #[test]
    fn parse_yyyy_mm_dd() {
        let d: ResumeDate = "2024-11-15".parse().unwrap();
        assert_eq!(d.year, 2024);
        assert_eq!(d.month, 11);
    }

    #[test]
    fn display_format() {
        let d = ResumeDate::new(2024, 11).unwrap();
        assert_eq!(d.to_string(), "Nov 2024");
    }

    #[test]
    fn wire_format() {
        let d = ResumeDate::new(2024, 3).unwrap();
        assert_eq!(d.to_wire_format(), "2024-03");
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
    fn serde_roundtrip() {
        let d = ResumeDate::new(2024, 11).unwrap();
        let json = serde_json::to_string(&d).unwrap();
        assert_eq!(json, r#""2024-11""#);
        let parsed: ResumeDate = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed, d);
    }

    #[test]
    fn none_sorts_before_some() {
        let none: Option<ResumeDate> = None;
        let some = Some(ResumeDate::new(2020, 1).unwrap());
        assert!(none < some);
    }
}
