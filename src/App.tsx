import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "sonner";

const App = () => (
  <>
    <RouterProvider router={router} />
    <Toaster richColors position="top-right" />
  </>
);

export default App;
