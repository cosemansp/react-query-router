import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import UserList from "./components/UserList";
import { useConfig } from "./hooks";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function App() {
  const config = useConfig();

  return (
    <div className="m-2">
      <QueryClientProvider client={queryClient}>
        <UserList />
        <ToastContainer />
      </QueryClientProvider>
    </div>
  );
}

export default App;
