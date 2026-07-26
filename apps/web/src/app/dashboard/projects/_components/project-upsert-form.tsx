"use client";

import { Button } from "@dcc-chatbot/ui/components/button";
import { DialogFooter } from "@dcc-chatbot/ui/components/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@dcc-chatbot/ui/components/field";
import { Input } from "@dcc-chatbot/ui/components/input";
import { Textarea } from "@dcc-chatbot/ui/components/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { useCreateProject } from "../_hooks/use-create-project";

const projectFormSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters.")
    .max(50, "Project name must be at most 50 characters."),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters.")
    .optional(),
  systemPrompt: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectUpsertFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function ProjectUpsertForm({
  onCancel,
  onSuccess,
}: ProjectUpsertFormProps) {
  const { mutate: createProject, isPending } = useCreateProject();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      systemPrompt: "",
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    createProject(data, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
      {/* Project Name Field */}
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Project Name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="e.g. Customer Support Bot"
              autoComplete="off"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Description Field */}
      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Description</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Brief summary of what this project is for..."
              rows={2}
            />
            <FieldDescription>
              Optional description for reference.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* System Prompt Field */}
      <Controller
        name="systemPrompt"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Default System Prompt</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="e.g. You are a helpful assistant specialized in software documentation..."
              rows={3}
            />
            <FieldDescription>
              Initial system prompt instructions for AI responses.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <DialogFooter className="pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Project"}
        </Button>
      </DialogFooter>
    </form>
  );
}
