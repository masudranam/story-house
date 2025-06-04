import { Request, Response, NextFunction } from "express";
import { storyService } from "../services/storyService.ts";
import { httpStatus } from "../utils/httpStatus.ts";
import { Story } from "../database/database.ts";


class StoryController{
    async postStory(req: Request, res: Response, next: NextFunction){
        try{
            console.log('Hi there from post', req.body);
            const story = await storyService.postStory(req.body);
            res.status(httpStatus.CREATED)
               .json({message: 'Story Successfully created', data: story});
        }catch(err){
            next(err);
        }
    }

    async getStories(req: Request, res: Response){
        try{
            console.log('Hi there from getStories');
          const stories = await Story.findAll();  
          res.status(httpStatus.OK).json(stories);
        }catch(err){
            res.status(httpStatus.NOT_FOUND).json({message:"There is something wrong"});
        }
        
    }
}

export const storyController = new StoryController();