
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
         <AppRoutes />
      </BrowserRouter>
    </UserProvider>
   
  );
};

export default App;

