import { createRouter, procedure } from "../router";

const articles = createRouter({
  getAll: procedure.query(() => {
    console.log("> getAll");
    return Promise.resolve("1");
  }),
  getById: procedure.query((id: number) => {
    console.log("> getById", id);
    return Promise.resolve(id.toString());
  }),
  update: procedure.mutation((variables: { name: string }) => {
    console.log("> update", variables);
    return Promise.resolve(true);
  }),
});

export default articles;
