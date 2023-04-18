import React from "react";
import { useApiInstance } from "./useApiInstance";
import { createRouter } from "../lib/router";

const useQueryRouter = () => {
  const api = useApiInstance();
  return createRouter({
    users: 
  });
};

export default useQueryRouter;
