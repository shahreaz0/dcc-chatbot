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
import { Textarea } from "@dcc-chatbot/ui/components/textarea";
import { Plus, Sparkles, Terminal, Trash2 } from "lucide-react";
import { useState } from "react";
import { useCreatePrompt } from "./_hooks/use-create-prompt";
import { useDeletePrompt } from "./_hooks/use-delete-prompt";
import { useGetPrompts } from "./_hooks/use-get-prompts";

export default function PromptsPage() {
	const { data: prompts = [], isLoading } = useGetPrompts();
	const { mutate: createPrompt, isPending: isCreating } = useCreatePrompt();
	const { mutate: deletePrompt, isPending: isDeleting } = useDeletePrompt();

	const [name, setName] = useState("");
	const [prompt, setPromptText] = useState("");
	const [description, setDescription] = useState("");
	const [showCreate, setShowCreate] = useState(false);

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !prompt.trim()) return;
		createPrompt(
			{ name, prompt, description },
			{
				onSuccess: () => {
					setName("");
					setPromptText("");
					setDescription("");
					setShowCreate(false);
				},
			},
		);
	};

	return (
		<div className="mx-auto max-w-6xl space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-2xl tracking-tight">System Prompts</h1>
					<p className="text-muted-foreground text-sm">
						Customize AI behavior, persona instructions, and guardrails
					</p>
				</div>
				<Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
					<Plus className="h-4 w-4" /> New Prompt
				</Button>
			</div>

			{/* Create Prompt Form */}
			{showCreate && (
				<Card className="border-primary/30 bg-primary/5 shadow-md">
					<CardHeader>
						<CardTitle className="text-lg">Create System Prompt</CardTitle>
						<CardDescription>
							Define system instructions for your chatbot sessions
						</CardDescription>
					</CardHeader>
					<form onSubmit={handleCreate}>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="prompt-name">Prompt Title</Label>
								<Input
									id="prompt-name"
									placeholder="e.g. Technical Code Reviewer"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="prompt-desc">Description (Optional)</Label>
								<Input
									id="prompt-desc"
									placeholder="Short description of this persona"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="prompt-content">
									System Prompt Instructions
								</Label>
								<Textarea
									id="prompt-content"
									placeholder="You are a helpful software engineering assistant..."
									rows={4}
									value={prompt}
									onChange={(e) => setPromptText(e.target.value)}
									required
								/>
							</div>
						</CardContent>
						<CardFooter className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowCreate(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isCreating}>
								{isCreating ? "Saving..." : "Save Prompt"}
							</Button>
						</CardFooter>
					</form>
				</Card>
			)}

			{/* Prompts Grid */}
			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{[1, 2].map((i) => (
						<Card key={i} className="h-48 animate-pulse bg-muted/40" />
					))}
				</div>
			) : prompts.length === 0 ? (
				<Card className="border-dashed p-8 text-center">
					<Terminal className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-50" />
					<h3 className="font-semibold text-lg">No System Prompts</h3>
					<p className="mb-4 text-muted-foreground text-sm">
						Create custom prompts to instruct the AI
					</p>
					<Button onClick={() => setShowCreate(true)} className="gap-2">
						<Plus className="h-4 w-4" /> Create System Prompt
					</Button>
				</Card>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{prompts.map((p) => (
						<Card
							key={p.id}
							className="flex flex-col justify-between border-border/60 hover:shadow-md"
						>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="flex items-center gap-2 font-semibold text-base">
										<Sparkles className="h-4 w-4 text-primary" /> {p.name}
									</CardTitle>
								</div>
								{p.description && (
									<CardDescription className="mt-1 text-xs">
										{p.description}
									</CardDescription>
								)}
							</CardHeader>

							<CardContent>
								<pre className="max-h-36 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border/40 bg-muted/50 p-3 font-mono text-foreground/90 text-xs">
									{p.prompt}
								</pre>
							</CardContent>

							<CardFooter className="flex justify-end border-border/40 border-t pt-3">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => deletePrompt(p.id)}
									disabled={isDeleting}
									className="text-muted-foreground hover:text-destructive"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
