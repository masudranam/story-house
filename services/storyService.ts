import { createStoryDTO } from "../dto/DTO";
import { Story } from "../database/database.ts";
import { userRepository } from "../repository/userRepository.ts";
 

class StoryService{
    async postStory(data: createStoryDTO){
        const username = data.authorUsername;
        const author = await userRepository.getUserByUsername(username);
        if(!author){
            return new Error("Author doesn't exist");
        }

        const story = await Story.create({
            title: data.title,
            description: data.description,
            authorUsername: data.authorUsername,
            authorName: author?.name,
            authorId: author?.id,
            lastModifierId: author?.id,
            lastModificationTime: new Date()
        })
        return story;
    }
}

export const storyService = new StoryService();