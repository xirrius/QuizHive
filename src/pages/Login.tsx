import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LoginForm } from "../components/molecules/LoginForm";


const Login = () => {
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
}
export default Login