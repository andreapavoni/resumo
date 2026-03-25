use serde::{Deserialize, Serialize};

use super::date::ResumeDate;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Resume {
    pub basics: Option<Basics>,
    pub work: Option<Vec<Work>>,
    pub education: Option<Vec<Education>>,
    pub skills: Option<Vec<Skill>>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Basics {
    pub name: Option<String>,
    pub label: Option<String>,
    pub image: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub url: Option<String>,
    pub summary: Option<String>,
    pub location: Option<Location>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Location {
    pub city: Option<String>,
    pub region: Option<String>,
    pub country_code: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Work {
    pub name: Option<String>,
    pub location: Option<String>,
    pub position: Option<String>,
    pub start_date: Option<ResumeDate>,
    pub end_date: Option<ResumeDate>,
    pub summary: Option<String>,
    pub highlights: Option<Vec<String>>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Education {
    pub institution: Option<String>,
    pub area: Option<String>,
    pub study_type: Option<String>,
    pub start_date: Option<ResumeDate>,
    pub end_date: Option<ResumeDate>,
    pub score: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Skill {
    pub name: Option<String>,
    pub level: Option<String>,
    pub keywords: Option<Vec<String>>,
}
