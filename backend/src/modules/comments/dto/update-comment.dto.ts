import { CreateCommentDto } from './create-comment.dto';

/** PATCH body is the same single required field as creation (contract: { content }). */
export class UpdateCommentDto extends CreateCommentDto {}
