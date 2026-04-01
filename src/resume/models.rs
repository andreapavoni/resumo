//! Data models for the [JSON Resume](https://jsonresume.org/schema) schema.
//!
//! All structs derive `Default` so partial documents deserialize cleanly;
//! every field is `Option` to match the schema's "all fields optional" rule.
//! Field names follow the schema's camelCase convention via `#[serde(rename_all = "camelCase")]`.

use serde::{Deserialize, Serialize};

use super::date::ResumeDate;

/// Root type representing a complete or partial JSON Resume document.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Resume {
    pub basics: Option<Basics>,
    pub work: Option<Vec<Work>>,
    pub volunteer: Option<Vec<Volunteer>>,
    pub education: Option<Vec<Education>>,
    pub awards: Option<Vec<Award>>,
    pub certificates: Option<Vec<Certificate>>,
    pub publications: Option<Vec<Publication>>,
    pub skills: Option<Vec<Skill>>,
    pub languages: Option<Vec<Language>>,
    pub interests: Option<Vec<Interest>>,
    pub references: Option<Vec<Reference>>,
    pub projects: Option<Vec<Project>>,
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
    pub profiles: Option<Vec<Profile>>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Location {
    pub address: Option<String>,
    pub postal_code: Option<String>,
    pub city: Option<String>,
    pub country_code: Option<String>,
    pub region: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    pub network: Option<String>,
    pub username: Option<String>,
    pub url: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Work {
    pub name: Option<String>,
    pub location: Option<String>,
    pub description: Option<String>,
    pub position: Option<String>,
    pub url: Option<String>,
    #[serde(deserialize_with = "super::date::deserialize_optional")]
    pub start_date: Option<ResumeDate>,
    #[serde(deserialize_with = "super::date::deserialize_optional")]
    pub end_date: Option<ResumeDate>,
    pub summary: Option<String>,
    pub highlights: Option<Vec<String>>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Volunteer {
    pub organization: Option<String>,
    pub position: Option<String>,
    pub url: Option<String>,
    #[serde(deserialize_with = "super::date::deserialize_optional")]
    pub start_date: Option<ResumeDate>,
    #[serde(deserialize_with = "super::date::deserialize_optional")]
    pub end_date: Option<ResumeDate>,
    pub summary: Option<String>,
    pub highlights: Option<Vec<String>>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Education {
    pub institution: Option<String>,
    pub url: Option<String>,
    pub area: Option<String>,
    pub study_type: Option<String>,
    #[serde(deserialize_with = "super::date::deserialize_optional")]
    pub start_date: Option<ResumeDate>,
    #[serde(deserialize_with = "super::date::deserialize_optional")]
    pub end_date: Option<ResumeDate>,
    pub score: Option<String>,
    pub courses: Option<Vec<String>>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Award {
    pub title: Option<String>,
    #[serde(deserialize_with = "super::date::deserialize_optional")]
    pub date: Option<ResumeDate>,
    pub awarder: Option<String>,
    pub summary: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Certificate {
    pub name: Option<String>,
    #[serde(deserialize_with = "super::date::deserialize_optional")]
    pub date: Option<ResumeDate>,
    pub url: Option<String>,
    pub issuer: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Publication {
    pub name: Option<String>,
    pub publisher: Option<String>,
    #[serde(deserialize_with = "super::date::deserialize_optional")]
    pub release_date: Option<ResumeDate>,
    pub url: Option<String>,
    pub summary: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Language {
    pub language: Option<String>,
    pub fluency: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Interest {
    pub name: Option<String>,
    pub keywords: Option<Vec<String>>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Reference {
    pub name: Option<String>,
    pub reference: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub name: Option<String>,
    pub description: Option<String>,
    pub highlights: Option<Vec<String>>,
    pub keywords: Option<Vec<String>>,
    #[serde(deserialize_with = "super::date::deserialize_optional")]
    pub start_date: Option<ResumeDate>,
    #[serde(deserialize_with = "super::date::deserialize_optional")]
    pub end_date: Option<ResumeDate>,
    pub url: Option<String>,
    pub roles: Option<Vec<String>>,
    pub entity: Option<String>,
    #[serde(rename = "type")]
    pub type_: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Skill {
    pub name: Option<String>,
    pub level: Option<String>,
    pub keywords: Option<Vec<String>>,
}
