"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../../state/user/userSlice";
import { doc, getDoc } from "firebase/firestore";
import { setScores } from "../../state/score/scoreSlice";
import { toast } from "react-hot-toast";

const formSchema = z.object({
  email: z.string().min(3, {
    message: "Email must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const fetchUserScores = async (userId: string) => {
  const userScoreRef = doc(db, "userScores", userId);
  const userScoreSnap = await getDoc(userScoreRef);
  if (userScoreSnap.exists()) {
    return userScoreSnap.data() || {};
  } else {
    console.log("No such document!");
    return {};
  }
};

export function LoginForm() {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
          })
        );
        const userScores = await fetchUserScores(user.uid);
        dispatch(setScores(userScores));
        console.log(user);
        toast.success("Login successful.");
        navigate("/");
      })
      .catch((error) => {
        let errorMessage = error.message || "An unexpected error occurred.";
        if (errorMessage == "Firebase: Error (auth/invalid-credential).")
          errorMessage =
            "Incorrect email or password. Make sure you have registered.";
        if (errorMessage == "Firebase: Error (auth/invalid-email).")
          errorMessage = "Invalid email address.";
        toast.error(errorMessage);
        console.log("Error registering user: ", error);
      });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 flex-col justify-center items-center"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full rounded-3xl">
          Login
        </Button>
        <Link
          to={"/register"}
          className="block text-sm underline text-indigo-300"
        >
          New here? Register now.
        </Link>
      </form>
    </Form>
  );
}
