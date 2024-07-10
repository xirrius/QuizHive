import { RegisterForm } from "../components/molecules/RegisterForm"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";


function Register() {
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

export default Register
