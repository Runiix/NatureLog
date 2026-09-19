import { notFound } from "next/navigation";
import { Add, Delete, Inbox } from "@mui/icons-material";
import { Button, ButtonLink } from "../../components/ui/Button";
import { Card, CardActions, CardHeader, CardTitle } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Field, Input, Textarea } from "../../components/ui/Field";
import { PageHeader } from "../../components/ui/PageHeader";
import { Skeleton, SkeletonCard, SkeletonText } from "../../components/ui/Skeleton";
import { Spinner } from "../../components/ui/Spinner";
import { ThemeToggle } from "../../components/ui/theme/ThemeToggle";
import UikitToastDemo from "./UikitToastDemo";

/** Development-only gallery of the UI primitives in both themes. */
export default function UikitPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="min-h-screen bg-canvas px-4 py-10 font-normal text-fg">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <PageHeader
          title="UI kit"
          subtitle="Primitives on the theme tokens"
          backHref="/"
          backLabel="Home"
          actions={<ThemeToggle />}
        />

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Buttons</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button icon={<Add />}>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger" icon={<Delete />}>
              Danger
            </Button>
            <Button variant="link">Link</Button>
            <Button loading>Saving</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <ButtonLink href="/lexiconpage" variant="secondary">
              ButtonLink
            </ButtonLink>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Solid card</CardTitle>
              <CardActions>
                <Button variant="ghost" size="icon" aria-label="Delete">
                  <Delete />
                </Button>
              </CardActions>
            </CardHeader>
            <p className="pt-3 text-sm text-fg-muted">Body copy in fg-muted.</p>
          </Card>
          <Card variant="gradient" interactive as="button" type="button" className="text-left">
            <CardTitle>Interactive gradient</CardTitle>
            <p className="pt-2 text-sm text-fg-muted">Hover and focus me.</p>
          </Card>
          <Card variant="flat">
            <CardTitle>Flat card</CardTitle>
            <p className="pt-2 text-sm text-fg-muted">For nested surfaces.</p>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="flex flex-col gap-4">
            <Field label="Title" hint="Up to 80 characters" required>
              <Input placeholder="Garden birds" />
            </Field>
            <Field label="Description" error="Too long">
              <Textarea defaultValue="…" />
            </Field>
          </Card>
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-accent">
              <Spinner size="sm" />
              <Spinner />
              <Spinner size="lg" label="Loading" />
            </div>
            <Skeleton className="h-24 w-full" />
            <SkeletonText />
            <SkeletonCard />
          </Card>
        </section>

        <EmptyState
          icon={<Inbox />}
          title="Nothing here yet"
          description="Empty states replace blank gaps."
          action={<Button icon={<Add />}>Create</Button>}
        />

        <UikitToastDemo />
      </div>
    </div>
  );
}
