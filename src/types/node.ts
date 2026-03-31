import type { ClusterId } from "@/constants/cluster";

export type Cluster = ClusterId;

export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

export interface RelatedConcept {
  slug: string;
  relationship: string;
}

export interface NodeFrontmatter {
  slug: string;
  title: string;
  cluster: Cluster;
  difficulty: Difficulty;
  prerequisites: string[];
  relatedConcepts: RelatedConcept[];
  childConcepts: string[];
  tags: string[];
}
