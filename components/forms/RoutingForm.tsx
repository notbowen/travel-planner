"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { submitForm } from "@/app/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formSchema = z.object({
    start: z.string().min(1),
    end: z.string().optional(),
    places: z.string().min(1),
    mode: z.enum(["drive", "walking", "bicycling", "transit"]),
})

export function RoutingForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const [result, setResult] = useState<any>(null);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData()
        Object.entries(values).forEach(([key, value]) => {
            formData.append(key, value as string)
        })

        const response = await submitForm(formData);
        setResult(response);

        console.log(response);
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                    <FormField
                        control={form.control}
                        name="start"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Starting Point</FormLabel>
                                <FormControl>
                                    <Input placeholder="1 Example Street" {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="end"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="1 Example Street" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Leave empty to set this as the start.
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="places"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Places to Go</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="1 Example Street" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Separate the destinations with new lines
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="mode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mode of Travel</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a mode of travel"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="drive">Driving</SelectItem>
                                            <SelectItem value="walking">Walking</SelectItem>
                                            <SelectItem value="bicycling">Bicycling</SelectItem>
                                            <SelectItem value="transit">Transit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <Button type="submit">Submit</Button>
                </form>
            </Form>

            <hr className="w-full my-8"/>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead>Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {result?.length > 0 ? (
                        result.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell><strong>{item.start}</strong> to <strong>{item.end}</strong></TableCell>
                                <TableCell>{item.duration}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell>??? to ???</TableCell>
                            <TableCell>?? mins</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    )
}

