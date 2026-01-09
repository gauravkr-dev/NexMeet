"use client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Card, CardContent } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"

// Define the schema for form validation
const formSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
})

export const SignInView = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize the form with react-hook-form and zod resolver
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        await authClient.signIn.email(
            {
                email: data.email,
                password: data.password
            },
            {
                onSuccess: () => {
                    router.push('/');
                    toast.success('Successfully signed in!');
                    setIsSubmitting(false);
                },
                onError: () => {
                    toast.error('Failed to sign in. Please check your credentials and try again.');
                    setIsSubmitting(false);
                },
            }
        );
    }
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <Card className="overflow-hidden p-0 max-w-md w-full">
                <CardContent className="grid p-0">
                    <Form {...form}>
                        <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                                    <p className="text-muted-foreground text-balance">Please sign in to your account</p>
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="gaurav@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                </div>
                                <div className="grid gap-3">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="********" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                </div>
                                <Button disabled={isSubmitting} type="submit" className="mt-4 w-full">
                                    {isSubmitting ? "Signing In..." : "Sign In"}
                                </Button>
                                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                    <span className="bg-card text-muted-foreground relative z-10 px-2">Or continue with</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button disabled={isSubmitting} className="w-full" variant="outline" type="button">
                                        Google
                                    </Button>
                                    <Button disabled={isSubmitting} className="w-full" variant="outline" type="button">
                                        GitHub
                                    </Button>
                                    <div className="text-sm text-center col-span-4 mt-2 gap-2 flex justify-center">
                                        Don&apos;t have an account? <Link href="/sign-up" className="text-blue-600 underline hover:text-blue-800">Sign Up</Link>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <div className="mt-4 text-center text-xs text-muted-foreground max-w-xs px-4">
                By signing in, you agree to our{' '}
                <Link href="#" className="text-blue-600 underline hover:text-blue-800">
                    Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-blue-600 underline hover:text-blue-800">
                    Privacy Policy
                </Link>.
            </div>
        </div>
    )
}
