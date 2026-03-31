import { z } from "zod";
import { CLUSTER_IDS } from "@/constants/cluster";

const clusterEnum = z.enum(CLUSTER_IDS);

const difficultyEnum = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

const relatedConceptSchema = z.object({
  slug: z.string(),
  relationship: z.string(),
});

export const nodeFrontmatterSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug은 kebab-case만 허용"),
  title: z.string().min(1),
  cluster: clusterEnum,
  difficulty: difficultyEnum,
  prerequisites: z.array(z.string()).default([]),
  relatedConcepts: z.array(relatedConceptSchema).default([]),
  childConcepts: z.array(z.string()).default([]),
  tags: z.array(z.string()).min(1),
});
