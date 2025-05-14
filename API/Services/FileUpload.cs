namespace API.Services;

public class FileUpload
{
    public static async Task<string> UploadFile(IFormFile file)
    {
        var UploadFolder = Path.Combine(Directory.GetCurrentDirectory(),"wwwroot","upload");
        
        if (!Directory.Exists(UploadFolder))
            Directory.CreateDirectory(UploadFolder);
        
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var path = Path.Combine(UploadFolder, fileName);
            await using var stream = new FileStream(path, FileMode.Create);
            await file.CopyToAsync(stream);
            return fileName;

    }
}