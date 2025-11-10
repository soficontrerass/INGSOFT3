// This file exports TypeScript interfaces and types used throughout the server application, providing type safety for request and response objects. 

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    description?: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
}

export interface UpdateUserRequest {
    id: string;
    name?: string;
    email?: string;
}