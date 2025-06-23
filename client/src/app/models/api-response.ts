export interface ApiResponse<T>
{
    isSuccessful : boolean;
    data : T;
    error:string;
    message : string;
}