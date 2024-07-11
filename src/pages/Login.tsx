import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { LoginForm } from "../components/molecules/LoginForm";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { user } = useSelector((state: RootState) => state);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.uid) {
      navigate("/");
    }
  }, []);

  return (
    <main className="h-screen flex items-center justify-center ">
      <Card className="w-[350px] shadow-lg">
        <CardHeader>
          <CardTitle>Login Here.</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm></LoginForm>
        </CardContent>
      </Card>
    </main>
  );
};
export default Login;
