import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { StoryCommentsController } from './story-comments.controller';

@Module({
  controllers: [StoryCommentsController, CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
