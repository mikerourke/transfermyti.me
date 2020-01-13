import { Mapping } from "~/allEntities/allEntitiesTypes";

export interface CredentialsModel {
  apiKey: string | null;
  email: string | null;
  userId: string | null;
}

export type CredentialsByMappingModel = Record<Mapping, CredentialsModel>;

export type ValidationErrorsByMappingModel = Record<Mapping, string | null>;

export interface PartialCredentialsUpdateModel {
  mapping: Mapping;
  apiKey?: string | null;
  email?: string | null;
  userId?: string | null;
}
