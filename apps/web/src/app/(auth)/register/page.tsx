"use client";

import { Button } from "@dcc-chatbot/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@dcc-chatbot/ui/components/card";
import { Input } from "@dcc-chatbot/ui/components/input";
import { Label } from "@dcc-chatbot/ui/components/label";
import Link from "next/link";
import { useState } from "react";
import { useRegister } from "../_hooks/use-auth";

export default function RegisterPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { mutate: register, isPending } = useRegister();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !email || !password) return;
		register({ name, email, password });
	};

	return (
		<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
			<Card className="w-full max-w-md border-border/40 shadow-xl backdrop-blur-md">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="font-bold text-2xl tracking-tight">
						Create Account
					</CardTitle>
					<CardDescription>Get started with DCC Chatbot system</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit} className="space-y-6">
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input
								id="name"
								type="text"
								placeholder="John Doe"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="name@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
					</CardContent>
					<CardFooter className="flex flex-col space-y-4 pt-2">
						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending ? "Creating Account..." : "Register"}
						</Button>
						<p className="text-center text-muted-foreground text-xs">
							Already have an account?{" "}
							<Link
								href="/signin"
								className="font-medium text-primary underline hover:text-primary/80"
							>
								Sign in
							</Link>
						</p>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
