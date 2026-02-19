import { RoleDefinition } from "./types";
import { harvester } from "./harvester";
import { hauler } from "./hauler";
import { upgrader } from "./upgrader";
import { builder } from "./builder";
import { warrior } from "./warrior";

export const roles: Record<string, RoleDefinition> = {
  harvester: harvester,
  hauler: hauler,
  upgrader: upgrader,
  builder: builder,
  warrior: warrior,
};
