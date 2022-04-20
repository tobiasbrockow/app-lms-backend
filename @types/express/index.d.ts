import express from "express";
import { ObjectId } from "mongodb";

export interface CourseState {
  active: boolean;
  _id: ObjectId;
  id?: number;
  title?: string;
  img_src?: string;
  des?: string;
  url?: string;
  time_created?: string;
  time_lastchanged?: string;
  modules?: ModuleState[];
}

interface ModuleState {
  id: number;
  title: string;
  completed: boolean;
  completed_percentage: number;
  sections: SectionState[];
}

interface SectionState {
  id: number;
  title: string;
  completed: boolean;
  articles: ArticleState[];
}

export interface ArticleState {
  active: boolean;
  content?: ArticleContentState;
}

export interface ArticleContentState {
  id: number;
  courseId: number;
  title: string;
  node: NodeState;
  instruction?: InstructionState;
}

export interface NodeState {
  paragraphs: ParagraphState[];
}

export interface ParagraphState {
  paragraphType: "text" | "image" | "list";
  content: ParagraphContentState[];
}

export interface ParagraphContentState {
  type?: "textSpan" | "listItem" | "image";
  value?: string;
  format?: "bold" | "underline" | "italic" | "underlyingAppMarker";
  selector?: NodeSelector;
  image?: ImageState;
  listSpans?: ParagraphContentState[];
}

export interface NodeSelector {
  selector: string;
  index: number;
}

export interface ImageState {
  src: string;
  alt: string;
}

export interface InstructionState {
  tasks?: TaskState[];
}

export interface TaskState {
  title: string;
  description: string;
  completed: boolean;
  requirement: "element-visible" | "click";
  selector?: NodeSelector;
}

declare global {
  namespace Express {
    interface Request {
      course: CourseState;
      article: ArticleState;
    }
  }
}

declare module "express-session" {
  interface Session {
    authenticated: boolean;
  }
}

declare global {
  namespace Express {
    interface User {
      email: string
      password: string
      name: string
      courses: CourseUser[]
    }
    
    interface CourseUser {
      id: number
      completed: boolean
    }
  }
}