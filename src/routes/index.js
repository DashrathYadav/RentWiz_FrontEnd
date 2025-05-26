import { createBrowserRouter } from "react-router-dom";

// project import
import LoginRoutes from "./LoginRoutes";
import MainRoutes from "./MainRoutes";

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([LoginRoutes, MainRoutes]);

export default router;
