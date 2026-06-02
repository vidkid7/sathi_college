import { PrismaClient } from "@prisma/client";
import {
  REAL_IMAGES,
  careerImageFor,
  courseImageFor,
  examImageFor,
  isPlaceholderImage,
  postImageFor
} from "../src/lib/real-images";

const db = new PrismaClient();

async function main() {
  const counts = {
    courses: 0,
    careers: 0,
    exams: 0,
    posts: 0,
    communities: 0,
    communityPosts: 0
  };

  const courses = await db.course.findMany({
    select: { id: true, name: true, category: true, image: true }
  });
  for (const course of courses) {
    if (!isPlaceholderImage(course.image)) continue;
    await db.course.update({
      where: { id: course.id },
      data: { image: courseImageFor({ name: course.name, category: course.category }) }
    });
    counts.courses += 1;
  }

  const careers = await db.career.findMany({
    select: { id: true, name: true, sector: true, image: true }
  });
  for (const career of careers) {
    if (!isPlaceholderImage(career.image)) continue;
    await db.career.update({
      where: { id: career.id },
      data: { image: careerImageFor({ name: career.name, sector: career.sector }) }
    });
    counts.careers += 1;
  }

  const exams = await db.exam.findMany({
    select: { id: true, name: true, category: true, heroImage: true }
  });
  for (const exam of exams) {
    if (!isPlaceholderImage(exam.heroImage)) continue;
    await db.exam.update({
      where: { id: exam.id },
      data: { heroImage: examImageFor({ name: exam.name, category: exam.category }) }
    });
    counts.exams += 1;
  }

  const posts = await db.post.findMany({
    select: {
      id: true,
      title: true,
      coverImage: true,
      category: { select: { name: true } }
    }
  });
  for (const post of posts) {
    if (!isPlaceholderImage(post.coverImage)) continue;
    await db.post.update({
      where: { id: post.id },
      data: { coverImage: postImageFor({ title: post.title, category: post.category?.name }) }
    });
    counts.posts += 1;
  }

  const communities = await db.community.findMany({
    select: { id: true, image: true }
  });
  for (const community of communities) {
    if (!isPlaceholderImage(community.image)) continue;
    await db.community.update({
      where: { id: community.id },
      data: { image: REAL_IMAGES.news }
    });
    counts.communities += 1;
  }

  const communityPosts = await db.communityPost.findMany({
    select: { id: true, title: true, tag: true, imageUrl: true }
  });
  for (const post of communityPosts) {
    if (!isPlaceholderImage(post.imageUrl)) continue;
    await db.communityPost.update({
      where: { id: post.id },
      data: { imageUrl: postImageFor({ title: post.title, category: post.tag }) }
    });
    counts.communityPosts += 1;
  }

  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
