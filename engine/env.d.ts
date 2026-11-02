declare module "*.md?usulan" {
  const data: import("./plugin/parse-usulan.ts").UsulanData;
  export default data;
}
