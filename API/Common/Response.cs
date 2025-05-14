namespace API.Common;

public class Response<T>
{
    public bool IsSuccess { get; set; }
    public T Data { get; set; }
    public string? Error { get; set; }

    public string? Message { get; set; }


    public Response(bool isSuccess,T data , string? error,string? message)
    {
        isSuccess = isSuccess;  
        Message = message;
        Error = error;
        Data = data;
    }
    
    public static Response<T> Success(T data,string? message="")=> new 
        (true,data,null,message);
    
    public static Response<T> Failure(string error)=> new 
        (false,default,error,null);
    
}