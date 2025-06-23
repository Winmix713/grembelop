import { 
  GenerationProject, 
  InsertGenerationProject, 
  GeneratedComponentRecord, 
  InsertGeneratedComponent,
  User,
  InsertUser
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project methods
  createGenerationProject(project: InsertGenerationProject): Promise<GenerationProject>;
  getGenerationProject(id: number): Promise<GenerationProject | undefined>;
  getAllGenerationProjects(): Promise<GenerationProject[]>;
  updateGenerationProject(id: number, updates: Partial<GenerationProject>): Promise<GenerationProject | undefined>;
  deleteGenerationProject(id: number): Promise<void>;

  // Component methods
  createGeneratedComponent(component: InsertGeneratedComponent): Promise<GeneratedComponentRecord>;
  getGeneratedComponent(id: number): Promise<GeneratedComponentRecord | undefined>;
  getGeneratedComponentsByProject(projectId: number): Promise<GeneratedComponentRecord[]>;
  deleteGeneratedComponent(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private projects: Map<number, GenerationProject> = new Map();
  private components: Map<number, GeneratedComponentRecord> = new Map();
  private currentUserId: number = 1;
  private currentProjectId: number = 1;
  private currentComponentId: number = 1;

  constructor() {
    // Add some sample data for development
    this.createUser({
      username: 'demo',
      password: 'demo123'
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id 
    };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async createGenerationProject(project: InsertGenerationProject): Promise<GenerationProject> {
    const id = this.currentProjectId++;
    const now = new Date();
    const newProject: GenerationProject = {
      ...project,
      id,
      results: project.results || null,
      createdAt: now,
      updatedAt: now
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async getGenerationProject(id: number): Promise<GenerationProject | undefined> {
    return this.projects.get(id);
  }

  async getAllGenerationProjects(): Promise<GenerationProject[]> {
    return Array.from(this.projects.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateGenerationProject(id: number, updates: Partial<GenerationProject>): Promise<GenerationProject | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;

    const updated: GenerationProject = {
      ...existing,
      ...updates,
      id: existing.id, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    this.projects.set(id, updated);
    return updated;
  }

  async deleteGenerationProject(id: number): Promise<void> {
    // Delete associated components first
    const components = Array.from(this.components.values())
      .filter(comp => comp.projectId === id);
    
    for (const component of components) {
      this.components.delete(component.id);
    }

    // Delete the project
    this.projects.delete(id);
  }

  // Component methods
  async createGeneratedComponent(component: InsertGeneratedComponent): Promise<GeneratedComponentRecord> {
    const id = this.currentComponentId++;
    const now = new Date();
    const newComponent: GeneratedComponentRecord = {
      ...component,
      id,
      createdAt: now
    };
    this.components.set(id, newComponent);
    return newComponent;
  }

  async getGeneratedComponent(id: number): Promise<GeneratedComponentRecord | undefined> {
    return this.components.get(id);
  }

  async getGeneratedComponentsByProject(projectId: number): Promise<GeneratedComponentRecord[]> {
    return Array.from(this.components.values())
      .filter(comp => comp.projectId === projectId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async deleteGeneratedComponent(id: number): Promise<void> {
    this.components.delete(id);
  }
}

export const storage = new MemStorage();
