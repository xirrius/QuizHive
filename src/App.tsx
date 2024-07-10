import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import QuizComponent from "./components/molecules/QuizComponent";
import Category from "./pages/Category";
import Stats from "./pages/Stats";

const App = () => {
  
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={Home}/>
          <Route path="/login" Component={Login}/>
          <Route path="/register" Component={Register}/>
          <Route path="/category/:id" Component={Category}/>
          <Route path="/quiz/:id" Component={QuizComponent}/>
          <Route path="/stats" Component={Stats}/>
        </Routes>
      </BrowserRouter>
    </>
  );
};
export default App;
