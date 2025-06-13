import { RequestHandler } from 'express';
import prisma from '../config/prisma';

export const listStreams: RequestHandler = async (_req, res, next) => {
	try {
		const streams = await prisma.stream.findMany();
		res.json(streams);
	} catch (err) {
		next(err);
	}
};

export const createStream: RequestHandler = async (req, res, next) => {
	try {
		const { name } = req.body as { name?: string };
		if (!name) {
			res.status(400).json({ error: 'Missing `name` in request body' });
			return;
		}
		const stream = await prisma.stream.create({ data: { name } });
		res.status(201).json(stream);
	} catch (err) {
		next(err);
	}
};

export const listCourses: RequestHandler = async (_req, res, next) => {
	try {
		const now = new Date();
		const courses = await prisma.course.findMany({
			include: {
				stream: true,
				instructors: {
					include: { instructor: { include: { user: true } } },
				},
				discounts: true,
				modules: true,
			},
		});

		const result = courses.map((c) => {
			const active = c.discounts
				.filter((d) => !d.validUntil || d.validUntil > now)
				.sort((a, b) => b.percent - a.percent)[0];
			const discountPercent = active?.percent ?? 0;
			const discountedPrice = Math.round(
				(c.priceCents * (100 - discountPercent)) / 100,
			);
			return {
				id: c.id,
				title: c.title,
				thumbnail_url: c.thumbnail_url,
				description: c.description,
				type: c.type,
				StartDate: c.StartDate,
				isPopular: c.isPopular,
				priceCents: c.priceCents,
				discountedPrice,
				discountPercent,
				stream: c.stream,
				instructors: c.instructors.map((ci) => ({
					id: ci.instructor.id,
					name: ci.instructor.user.name,
					email: ci.instructor.user.email,
				})),
				modules: c.modules,
			};
		});

		res.json(result);
	} catch (err) {
		next(err);
	}
};

export const getCourse: RequestHandler<{ id: string }> = async (
	req,
	res,
	next,
) => {
	try {
		const { id } = req.params;
		const course = await prisma.course.findUnique({
			where: { id },
			include: {
				stream: true,
				instructors: {
					include: { instructor: { include: { user: true } } },
				},
				discounts: true,
				modules: true
			},
		});
		if (!course) {
			res.status(404).json({ error: 'Course not found' });
			return;
		}
		// Calculate discount
		const now = new Date();
		const activeDiscount = course.discounts
			.filter((d) => !d.validUntil || d.validUntil > now)
			.sort((a, b) => b.percent - a.percent)[0];
		const discountPercent = activeDiscount?.percent ?? 0;
		const discountedPrice = Math.round(
			(course.priceCents * (100 - discountPercent)) / 100
		);

		res.json({
			id: course.id,
			title: course.title,
			thumbnail_url: course.thumbnail_url,
			description: course.description,
			type: course.type,
			StartDate: course.StartDate,
			isPopular: course.isPopular,
			priceCents: course.priceCents,
			discountedPrice,
			discountPercent,
			stream: course.stream,
			instructors: course.instructors.map((ci) => ({
				id: ci.instructor.id,
				name: ci.instructor.user.name,
				email: ci.instructor.user.email,
			})),
			modules: course.modules,
		});
	} catch (err) {
		next(err);
	}
};

export const createCourse: RequestHandler = async (req, res, next) => {
	try {
		const { title, description, type, priceCents, streamId, instructorIds, thumbnail_url, StartDate } =
			req.body as {
				title?: string;
				description?: string;
				type?: 'LIVE' | 'SELF_PACED';
				priceCents?: number;
				streamId?: string;
				instructorIds?: string[];
				thumbnail_url?: string;
				StartDate?: string;
			};

		// Basic validation
		if (
			!title ||
			!description ||
			!type ||
			priceCents == null ||
			!streamId ||
			!Array.isArray(instructorIds) ||
			!thumbnail_url
		) {
			res.status(400).json({
				error:
					'Missing or invalid fields: title, description, type, priceCents, streamId, instructorIds, thumbnail_url',
			});
			return;
		}

		// If StartDate is provided, validate it's a valid date
		let startDateObj: Date | undefined;
		if (StartDate) {
			startDateObj = new Date(StartDate);
			if (isNaN(startDateObj.getTime())) {
				res.status(400).json({
					error: 'Invalid StartDate format. Please provide a valid ISO date string',
				});
				return;
			}
		}

		const course = await prisma.course.create({
			data: {
				title,
				description,
				type,
				priceCents,
				StartDate: startDateObj,
				stream: { connect: { id: streamId } },
				instructors: {
					create: instructorIds.map((instId) => ({
						instructor: { connect: { id: instId } },
					})),
				},
				thumbnail_url,
			},
			include: { instructors: true },
		});

		if (thumbnail_url) {
			await prisma.media.update({
				where: { key: thumbnail_url },
				data: {
					entity: 'Course',
					entityId: course.id,
					linkedAt: new Date(),
				},
			});
		}
		res.status(201).json(course);
	} catch (err) {
		next(err);
	}
};

export const enrollCourse: RequestHandler<{ id: string }> = async (
	req,
	res,
	next,
) => {
	try {
		// 1) Ensure authenticated
		if (!req.user?.id) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}
		const userId = req.user.id;

		// 2) Param validation
		const { id: courseId } = req.params;

		// 3) Check existing enrollment
		const existing = await prisma.enrollment.findUnique({
			where: { userId_courseId: { userId, courseId } },
		});
		if (existing) {
			res.status(200).json({ message: 'Already enrolled', data: existing });
			return;
		}

		// 4) Enroll
		const enrollment = await prisma.enrollment.create({
			data: { userId, courseId },
		});
		res.status(201).json(enrollment);
	} catch (err) {
		next(err);
	}
};

export const wishlistCourse: RequestHandler<{ id: string }> = async (
	req,
	res,
	next,
) => {
	try {
		if (!req.user?.id) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}
		const userId = req.user.id;
		const { id: courseId } = req.params;

		const existing = await prisma.wishlist.findUnique({
			where: { userId_courseId: { userId, courseId } },
		});
		if (existing) {
			res.status(200).json({ message: 'Already in wishlist', data: existing });
			return;
		}

		const wish = await prisma.wishlist.create({
			data: { userId, courseId },
		});
		res.status(201).json(wish);
	} catch (err) {
		next(err);
	}
};

export const getWishlistedCourses: RequestHandler = async (req, res, next) => {
	try {
		// 1) Ensure authenticated
		if (!req.user?.id) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}
		const userId = req.user.id;

		// 2) Fetch wishlisted courses with course details
		const now = new Date();
		const wishlist = await prisma.wishlist.findMany({
			where: { userId },
			include: {
				course: {
					include: {
						stream: true,
						instructors: {
							include: { instructor: { include: { user: true } } },
						},
						discounts: true,
						modules: true,
					},
				},
			},
		});

		// 3) Transform and calculate discounts for each course
		const result = wishlist.map((wish) => {
			const course = wish.course;
			const activeDiscount = course.discounts
				.filter((d) => !d.validUntil || d.validUntil > now)
				.sort((a, b) => b.percent - a.percent)[0];
			const discountPercent = activeDiscount?.percent ?? 0;
			const discountedPrice = Math.round(
				(course.priceCents * (100 - discountPercent)) / 100,
			);

			return {
				id: course.id,
				title: course.title,
				thumbnail_url: course.thumbnail_url,
				description: course.description,
				type: course.type,
				StartDate: course.StartDate,
				isPopular: course.isPopular,
				priceCents: course.priceCents,
				discountedPrice,
				discountPercent,
				stream: course.stream,
				instructors: course.instructors.map((ci) => ({
					id: ci.instructor.id,
					name: ci.instructor.user.name,
					email: ci.instructor.user.email,
				})),
				modules: course.modules,
			};
		});

		res.json(result);
	} catch (err) {
		next(err);
	}
};
