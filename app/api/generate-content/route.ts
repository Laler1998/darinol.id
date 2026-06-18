import { POST as ririPost } from "@/app/api/riri/route";

export async function POST(request: Request) {
  return ririPost(request);
}
