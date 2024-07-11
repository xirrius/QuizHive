import { useSelector } from "react-redux";
import { RegisterForm } from "../components/molecules/RegisterForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { RootState } from "../state/store";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Register() {
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
          <CardTitle>Register Here.</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm></RegisterForm>
        </CardContent>
      </Card>
    </main>
  );
}

export default Register;
