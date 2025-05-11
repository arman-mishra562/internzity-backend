import { Router } from 'express';
import validateRequest from '../middlewares/validateRequest';
import { isAuthenticated } from '../middlewares/auth.middleware';
import {
  createNote,
  listNotesForLecture,
  listNotesForUser,
} from '../controllers/note.controller';
import {
  createNoteSchema,
  lectureParamsSchema,
} from '../schemas/note.schema';

const router = Router();

router.post(
  '/',
  isAuthenticated,
  validateRequest({ body: createNoteSchema }),
  createNote
);

router.get(
  '/lecture/:lectureId',
  isAuthenticated,
  validateRequest({ params: lectureParamsSchema }),
  listNotesForLecture
);

router.get(
  '/my',
  isAuthenticated,
  listNotesForUser
);

export default router;
