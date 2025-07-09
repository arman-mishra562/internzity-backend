import { RequestHandler } from 'express';
import { mediaService } from '../services/media.service';

export const uploadMedia: RequestHandler = async (req, res, next) => {
	try {
		// multer has placed the file buffer on req.file
		if (!req.file) {
			res.status(400).json({ error: 'No file uploaded' });
			return;
		}

		const { buffer, originalname, mimetype, fieldname } = req.file;

		const typeMap: Record<string, string> = {
			profilePic: 'profile',
			thumbnail: 'thumbnail',
			lectureVideo: 'lecture_video',
		};
		const mediaType = typeMap[fieldname] || 'other';

		const { key, unsignedUrl } = await mediaService.upload(
			buffer,
			originalname,
			mimetype,
			mediaType,
		);

		// Respond with the S3 key (to store in your DB) and an unsigned URL for immediate preview
		res.status(201).json({ key, url: unsignedUrl });
	} catch (err) {
		next(err);
	}
};

export const getSignedMediaUrl: RequestHandler = async (req, res, next) => {
	try {
		const keyParam = req.query.key;
		// Narrow to a single string
		if (!keyParam || Array.isArray(keyParam) || typeof keyParam !== 'string') {
			res
				.status(400)
				.json({ error: 'Missing or invalid `key` query parameter' });
			return;
		}
		const signedUrl = await mediaService.getSignedUrl(keyParam);
		res.json({ url: signedUrl });
	} catch (err) {
		next(err);
	}
};
