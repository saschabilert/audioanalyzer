pa=hsv(100);


    
fid=fopen(['hsv.js'],'w');
% Writing the lines representing the header of the new file
fprintf(fid,'%s\n\n','var hsvScale;');
fprintf(fid,'%s\n','function creatHsv(){');
fprintf(fid,'%s','var rgbR=[');
for kk=1:length(pa)
    fprintf(fid,'%1.4f',(pa(kk,1)*255));
    fprintf(fid,'%s',',');
end
fprintf(fid,'%s\n\n',']');

fprintf(fid,'%s','var rgbG=[');
for kk=1:length(pa)
    fprintf(fid,'%1.4f',(pa(kk,2)*255));
    fprintf(fid,'%s',',');
end
fprintf(fid,'%s\n\n',']');


fprintf(fid,'%s','var rgbB=[');
for kk=1:length(pa)
    fprintf(fid,'%1.4f',pa(kk,3)*255);
    fprintf(fid,'%s',',');
end
fprintf(fid,'%s\n\n',']');

 fprintf(fid,'%s\n\n','hsvScale=[rgbR, rgbG, rgbB]'); 
 fprintf(fid,'%s','}');

 fclose(fid) ;

 