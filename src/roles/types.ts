export interface RoleDefinition {
  name: string;
  body(energyAvailable: number): BodyPartConstant[] | null;
  run(creep: Creep): void;
}
