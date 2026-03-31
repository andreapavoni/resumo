use serde::Serialize;
use url::Url;

use super::date::ResumeDate;
use super::models::Resume;

#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ErrorCode {
    InvalidEmail,
    InvalidUrl,
    EndDateBeforeStart,
    EndDateWithoutStart,
}

#[derive(Debug, Clone, Serialize)]
pub struct ValidationError {
    pub field: String,
    pub code: ErrorCode,
}

impl Resume {
    pub fn validate(&self) -> Vec<ValidationError> {
        let mut errors = Vec::new();

        if let Some(ref basics) = self.basics {
            check_email(&mut errors, "basics.email", &basics.email);
            check_url(&mut errors, "basics.url", &basics.url);

            if let Some(ref profiles) = basics.profiles {
                for (i, profile) in profiles.iter().enumerate() {
                    check_url(&mut errors, &format!("basics.profiles[{i}].url"), &profile.url);
                }
            }
        }

        if let Some(ref work) = self.work {
            for (i, entry) in work.iter().enumerate() {
                check_url(&mut errors, &format!("work[{i}].url"), &entry.url);
                check_date_range(&mut errors, &format!("work[{i}]"), &entry.start_date, &entry.end_date);
            }
        }

        if let Some(ref volunteer) = self.volunteer {
            for (i, entry) in volunteer.iter().enumerate() {
                check_url(&mut errors, &format!("volunteer[{i}].url"), &entry.url);
                check_date_range(&mut errors, &format!("volunteer[{i}]"), &entry.start_date, &entry.end_date);
            }
        }

        if let Some(ref education) = self.education {
            for (i, entry) in education.iter().enumerate() {
                check_url(&mut errors, &format!("education[{i}].url"), &entry.url);
                check_date_range(&mut errors, &format!("education[{i}]"), &entry.start_date, &entry.end_date);
            }
        }

        if let Some(ref publications) = self.publications {
            for (i, entry) in publications.iter().enumerate() {
                check_url(&mut errors, &format!("publications[{i}].url"), &entry.url);
            }
        }

        if let Some(ref certificates) = self.certificates {
            for (i, entry) in certificates.iter().enumerate() {
                check_url(&mut errors, &format!("certificates[{i}].url"), &entry.url);
            }
        }

        if let Some(ref projects) = self.projects {
            for (i, entry) in projects.iter().enumerate() {
                check_url(&mut errors, &format!("projects[{i}].url"), &entry.url);
                check_date_range(&mut errors, &format!("projects[{i}]"), &entry.start_date, &entry.end_date);
            }
        }

        errors
    }
}

fn check_email(errors: &mut Vec<ValidationError>, field: &str, value: &Option<String>) {
    if let Some(email) = value {
        let email = email.trim();
        if !email.is_empty() && !is_valid_email(email) {
            errors.push(ValidationError {
                field: field.to_string(),
                code: ErrorCode::InvalidEmail,
            });
        }
    }
}

fn check_url(errors: &mut Vec<ValidationError>, field: &str, value: &Option<String>) {
    if let Some(url) = value {
        let url = url.trim();
        if !url.is_empty() && !is_valid_url(url) {
            errors.push(ValidationError {
                field: field.to_string(),
                code: ErrorCode::InvalidUrl,
            });
        }
    }
}

fn check_date_range(
    errors: &mut Vec<ValidationError>,
    field_prefix: &str,
    start: &Option<ResumeDate>,
    end: &Option<ResumeDate>,
) {
    match (start, end) {
        (None, Some(_)) => errors.push(ValidationError {
            field: format!("{field_prefix}.endDate"),
            code: ErrorCode::EndDateWithoutStart,
        }),
        (Some(s), Some(e)) if e.as_end() < s.as_start() => errors.push(ValidationError {
            field: format!("{field_prefix}.endDate"),
            code: ErrorCode::EndDateBeforeStart,
        }),
        _ => {}
    }
}

fn is_valid_email(s: &str) -> bool {
    let Some((local, domain)) = s.split_once('@') else {
        return false;
    };
    !local.is_empty() && !domain.is_empty() && domain.contains('.')
}

fn is_valid_url(s: &str) -> bool {
    match Url::parse(s) {
        Ok(u) => matches!(u.scheme(), "http" | "https") && u.host().is_some(),
        Err(_) => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn valid_email() {
        assert!(is_valid_email("user@example.com"));
        assert!(is_valid_email("user+tag@sub.domain.org"));
    }

    #[test]
    fn invalid_emails() {
        assert!(!is_valid_email("noatsign"));
        assert!(!is_valid_email("@domain.com"));
        assert!(!is_valid_email("user@"));
        assert!(!is_valid_email("user@nodot"));
    }

    #[test]
    fn valid_urls() {
        assert!(is_valid_url("https://example.com"));
        assert!(is_valid_url("http://example.com"));
        assert!(is_valid_url("https://sub.domain.org/path?q=1"));
        assert!(is_valid_url("http://localhost:8080"));
    }

    #[test]
    fn invalid_urls() {
        assert!(!is_valid_url("ftp://example.com"));
        assert!(!is_valid_url("example.com"));
        assert!(!is_valid_url("not a url"));
        assert!(!is_valid_url("https://"));
        assert!(!is_valid_url("http://"));
    }

    #[test]
    fn validate_email_error_code() {
        use crate::resume::models::{Basics, Resume};
        let resume = Resume {
            basics: Some(Basics { email: Some("notanemail".to_string()), ..Default::default() }),
            ..Default::default()
        };
        let errors = resume.validate();
        assert_eq!(errors.len(), 1);
        assert_eq!(errors[0].field, "basics.email");
        assert_eq!(errors[0].code, ErrorCode::InvalidEmail);
    }

    #[test]
    fn validate_url_error_code() {
        use crate::resume::models::{Basics, Resume};
        let resume = Resume {
            basics: Some(Basics { url: Some("example.com".to_string()), ..Default::default() }),
            ..Default::default()
        };
        let errors = resume.validate();
        assert_eq!(errors.len(), 1);
        assert_eq!(errors[0].field, "basics.url");
        assert_eq!(errors[0].code, ErrorCode::InvalidUrl);
    }

    #[test]
    fn validate_end_date_without_start() {
        use crate::resume::date::ResumeDate;
        use crate::resume::models::{Resume, Work};
        let resume = Resume {
            work: Some(vec![Work {
                end_date: Some(ResumeDate::new(2024, 6).unwrap()),
                ..Default::default()
            }]),
            ..Default::default()
        };
        let errors = resume.validate();
        assert_eq!(errors.len(), 1);
        assert_eq!(errors[0].field, "work[0].endDate");
        assert_eq!(errors[0].code, ErrorCode::EndDateWithoutStart);
    }

    #[test]
    fn validate_end_date_before_start() {
        use crate::resume::date::ResumeDate;
        use crate::resume::models::{Resume, Work};
        let resume = Resume {
            work: Some(vec![Work {
                start_date: Some(ResumeDate::new(2024, 6).unwrap()),
                end_date: Some(ResumeDate::new(2023, 1).unwrap()),
                ..Default::default()
            }]),
            ..Default::default()
        };
        let errors = resume.validate();
        assert_eq!(errors.len(), 1);
        assert_eq!(errors[0].field, "work[0].endDate");
        assert_eq!(errors[0].code, ErrorCode::EndDateBeforeStart);
    }

    #[test]
    fn validate_clean_resume_no_errors() {
        use crate::resume::date::ResumeDate;
        use crate::resume::models::{Basics, Resume, Work};
        let resume = Resume {
            basics: Some(Basics {
                email: Some("jane@example.com".to_string()),
                url: Some("https://jane.dev".to_string()),
                ..Default::default()
            }),
            work: Some(vec![Work {
                url: Some("https://company.com".to_string()),
                start_date: Some(ResumeDate::new(2020, 1).unwrap()),
                end_date: Some(ResumeDate::new(2024, 3).unwrap()),
                ..Default::default()
            }]),
            ..Default::default()
        };
        assert!(resume.validate().is_empty());
    }
}
