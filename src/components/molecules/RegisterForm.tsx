"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
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
import { Link, useNavigate } from "react-router-dom";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";

const formSchema = z
  .object({
    email: z.string().min(2, {
      message: "Email must be at least 2 characters.",
    }),
    password: z.string().min(5, {
      message: "Password must be at least 5 characters.",
    }),
    confirmPassword: z.string().min(5, {
      message: "Password must be at least 5 characters.",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });


const initializeUserScores = async (userId:string, quizIds: string[]) => {
  const quizScores = quizIds.reduce((acc, quizId) => {
    acc[quizId] = 0
    return acc
  }, {} as { [key:string]: number})

  const userScoreRef = doc(db, "userScores", userId)
  await setDoc(userScoreRef, {...quizScores})
}


export function RegisterForm() {
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    createUserWithEmailAndPassword(auth, values.email, values.password)
      .then(async (userCredential) => {
        console.log(userCredential.user);

        const querySnapshot = await getDocs(collection(db, "quizzes"))
        const quizIds = querySnapshot.docs.map(doc => doc.id)
        await initializeUserScores(userCredential.user.uid, quizIds);
        navigate('/login')
      })
      .catch((error) => {
        console.error("Error registering user: ",error); 
      });
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full rounded-3xl">
          Register
        </Button>
        <Link to={"/login"} className="block text-sm underline text-indigo-300">
          Already registered? Login here.
        </Link>
      </form>
    </Form>
  );
}
