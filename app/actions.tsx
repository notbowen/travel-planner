'use server'

import { z } from "zod"

const formSchema = z.object({
    start: z.string().min(1),
    end: z.string().optional(),
    places: z.string().min(1),
    mode: z.enum(["drive", "walking", "bicycling", "transit"]),
})

export async function submitForm(formData: FormData) {
    const parsed = formSchema.parse({
        start: formData.get('start'),
        end: formData.get('end'),
        places: formData.get('places'),
        mode: formData.get('mode'),
    })

    // Extract variables
    const start = parsed.start;
    const end = parsed.end === undefined ? parsed.end ?? '' : start;
    const places = parsed.places.split('\n').map(place => place.replace('\r', ''));

    // Make API call to Google Maps API with optimization
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${start}&destination=${end}&waypoints=optimize:true|${places.join('|')}&key=${apiKey}`;
    const response = await fetch(apiUrl);

    // Extract optimized route from response
    const res = await response.json();
    const waypoint_order = res["routes"][0]["waypoint_order"];

    // Create final route
    const final_route = [start, ...waypoint_order.map((index: number) => places[index]), end];

    // Loop through each destination and calculate transit time
    const routeApiUrl = "https://routes.googleapis.com/directions/v2:computeRoutes";
    const headers = new Headers({
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey ?? "",
        "X-Goog-FieldMask": "routes.duration"
    });

    const timings = await Promise.all(final_route.map(async (_, index) => {
        if (index == final_route.length - 1) return;

        const data = JSON.stringify({
            "origin": { "address": final_route[index] },
            "destination": { "address": final_route[index + 1] },
            "travelMode": parsed.mode.toUpperCase(),
            "computeAlternativeRoutes": false,
        });

        const response = await fetch(routeApiUrl, { method: "POST", headers, body: data }).then(res => res.json());

        try {
            // Convert duration from seconds to minutes
            const seconds = parseInt(response["routes"][0]["duration"].replace('s', ''));
            return `${Math.ceil(seconds / 60)} min(s)`;
        } catch (e) {
            console.log(JSON.stringify(response));
            return "Route not found";
        }
    }));

    // Structure data to be returned
    return final_route.map((place, index) => {
        if (index === final_route.length - 1) return;

        return {
            start: decodeURIComponent(place),
            end: decodeURIComponent(final_route[index + 1]),
            duration: timings[index]
        }
    })
}