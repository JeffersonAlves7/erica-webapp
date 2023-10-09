export declare class UsersService {
    private readonly users;
    findOne(username: string): Promise<{
        userId: number;
        username: string;
        password: string;
    }>;
}
