import { H1, H2, H3, H4, Lead, Body, Muted, Code } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DesignPage() {
  return (
    <div className="space-y-16">
      <div>
        <H1>Design System</H1>
        <Lead className="mt-2">
          Component catalogue — every primitive with its variants. Change a token in{" "}
          <Code>globals.css</Code> and see it here.
        </Lead>
      </div>

      {/* ================================================================
          Color Palette
      ================================================================ */}
      <section className="space-y-4">
        <H2>Color Tokens</H2>
        <Muted>
          All colors are defined in the <Code>@theme</Code> block in{" "}
          <Code>globals.css</Code>. The shadcn CSS variables in <Code>:root</Code>{" "}
          map to these tokens.
        </Muted>

        <ColorGroup
          label="Primary (Fairway Green)"
          shades={[
            { name: "primary-50", bg: "bg-primary-50" },
            { name: "primary-100", bg: "bg-primary-100" },
            { name: "primary-200", bg: "bg-primary-200" },
            { name: "primary-300", bg: "bg-primary-300" },
            { name: "primary-400", bg: "bg-primary-400" },
            { name: "primary-500", bg: "bg-primary-500" },
            { name: "primary-600", bg: "bg-primary-600" },
            { name: "primary-700", bg: "bg-primary-700" },
            { name: "primary-800", bg: "bg-primary-800" },
            { name: "primary-900", bg: "bg-primary-900" },
          ]}
        />
        <ColorGroup
          label="Secondary (Warm Sand)"
          shades={[
            { name: "secondary-50", bg: "bg-secondary-50" },
            { name: "secondary-100", bg: "bg-secondary-100" },
            { name: "secondary-300", bg: "bg-secondary-300" },
            { name: "secondary-500", bg: "bg-secondary-500" },
            { name: "secondary-700", bg: "bg-secondary-700" },
            { name: "secondary-900", bg: "bg-secondary-900" },
          ]}
        />
        <ColorGroup
          label="Neutral (Warm Gray)"
          shades={[
            { name: "neutral-50", bg: "bg-neutral-50" },
            { name: "neutral-100", bg: "bg-neutral-100" },
            { name: "neutral-200", bg: "bg-neutral-200" },
            { name: "neutral-300", bg: "bg-neutral-300" },
            { name: "neutral-400", bg: "bg-neutral-400" },
            { name: "neutral-500", bg: "bg-neutral-500" },
            { name: "neutral-700", bg: "bg-neutral-700" },
            { name: "neutral-900", bg: "bg-neutral-900" },
          ]}
        />
        <ColorGroup
          label="Semantic"
          shades={[
            { name: "success-500", bg: "bg-success-500" },
            { name: "warning-500", bg: "bg-warning-500" },
            { name: "danger-500", bg: "bg-danger-500" },
            { name: "info-500", bg: "bg-info-500" },
          ]}
        />
      </section>

      <Separator />

      {/* ================================================================
          Typography
      ================================================================ */}
      <section className="space-y-4">
        <H2>Typography</H2>
        <Muted>
          All typography uses Inter via <Code>next/font</Code>. Use the wrapper
          components — never apply raw font-size classes directly on pages.
        </Muted>
        <div className="space-y-4 rounded-lg border border-border p-6">
          <H1>H1 — Page Title (4xl / bold)</H1>
          <H2>H2 — Section Heading (3xl / semibold)</H2>
          <H3>H3 — Subsection (2xl / semibold)</H3>
          <H4>H4 — Card Title (xl / semibold)</H4>
          <Lead>Lead — Introductory paragraph text (xl / muted-foreground)</Lead>
          <Body>Body — Standard paragraph text (base / foreground)</Body>
          <Muted>Muted — Secondary / helper text (sm / muted-foreground)</Muted>
          <p>
            Inline <Code>Code</Code> — monospace snippet
          </p>
        </div>
      </section>

      <Separator />

      {/* ================================================================
          Button
      ================================================================ */}
      <section className="space-y-4">
        <H2>Button</H2>
        <Muted>Token: <Code>--primary</Code> → <Code>var(--color-primary-600)</Code></Muted>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <Separator />

      {/* ================================================================
          Badge
      ================================================================ */}
      <section className="space-y-4">
        <H2>Badge</H2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      <Separator />

      {/* ================================================================
          Form Controls
      ================================================================ */}
      <section className="space-y-4">
        <H2>Form Controls</H2>
        <Muted>Token: <Code>--input</Code> → <Code>var(--color-neutral-200)</Code> · <Code>--ring</Code> → <Code>var(--color-primary-500)</Code></Muted>
        <div className="grid max-w-sm gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Alice Anderson" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>
        </div>
      </section>

      <Separator />

      {/* ================================================================
          Card
      ================================================================ */}
      <section className="space-y-4">
        <H2>Card</H2>
        <Muted>Token: <Code>--card</Code> · shadow: <Code>shadow-card</Code></Muted>
        <Card className="max-w-sm shadow-card">
          <CardHeader>
            <CardTitle>Wednesday Night League</CardTitle>
            <CardDescription>2026 Season · 9 holes</CardDescription>
          </CardHeader>
          <CardContent>
            <Body>6 active members · Commissioner: Alice Anderson</Body>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* ================================================================
          Tabs
      ================================================================ */}
      <section className="space-y-4">
        <H2>Tabs</H2>
        <Tabs defaultValue="scores" className="max-w-md">
          <TabsList>
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="scores" className="pt-4">
            <Body>Score entries would appear here.</Body>
          </TabsContent>
          <TabsContent value="standings" className="pt-4">
            <Body>Standings table would appear here.</Body>
          </TabsContent>
          <TabsContent value="schedule" className="pt-4">
            <Body>Schedule would appear here.</Body>
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* ================================================================
          Avatar
      ================================================================ */}
      <section className="space-y-4">
        <H2>Avatar</H2>
        <div className="flex flex-wrap items-center gap-3">
          <Avatar>
            <AvatarFallback>AA</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>BB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>CC</AvatarFallback>
          </Avatar>
        </div>
      </section>

      <Separator />

      {/* ================================================================
          Table
      ================================================================ */}
      <section className="space-y-4">
        <H2>Table</H2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Golfer</TableHead>
              <TableHead>Handicap</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Alice Anderson</TableCell>
              <TableCell>12.4</TableCell>
              <TableCell>44</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bob Baker</TableCell>
              <TableCell>18.2</TableCell>
              <TableCell>51</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <Separator />

      {/* ================================================================
          Skeleton
      ================================================================ */}
      <section className="space-y-4">
        <H2>Skeleton</H2>
        <Muted>Loading state placeholder.</Muted>
        <div className="space-y-2 max-w-sm">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </section>

      <Separator />

      {/* ================================================================
          Shadows
      ================================================================ */}
      <section className="space-y-4">
        <H2>Shadows</H2>
        <Muted>Three elevations only: card, popover, modal.</Muted>
        <div className="flex flex-wrap gap-6">
          <div className="rounded-lg bg-card p-6 shadow-card">
            <Muted>shadow-card</Muted>
          </div>
          <div className="rounded-lg bg-card p-6 shadow-popover">
            <Muted>shadow-popover</Muted>
          </div>
          <div className="rounded-lg bg-card p-6 shadow-modal">
            <Muted>shadow-modal</Muted>
          </div>
        </div>
      </section>
    </div>
  );
}

function ColorGroup({
  label,
  shades,
}: {
  label: string;
  shades: { name: string; bg: string }[];
}) {
  return (
    <div>
      <Muted className="mb-2 font-medium">{label}</Muted>
      <div className="flex flex-wrap gap-2">
        {shades.map(({ name, bg }) => (
          <div key={name} className="flex flex-col items-center gap-1">
            <div className={`h-10 w-16 rounded-md border border-border ${bg}`} />
            <span className="text-xs text-muted-foreground">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
