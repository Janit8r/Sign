//
//  DetectionPersonManager.m
//  LivenessDetection
//
//  Created by 张英堂 on 15/1/26.
//  Copyright (c) 2015年 megvii. All rights reserved.
//

#import "DetectionPersonManager.h"
#import "UIImage+Resize.h"
#import "LivenessDetector.h"
#import "YTMacro.h"
#import "NSDate+convenience.h"

#define KFINISHCOMPARE @"api_finish"

@interface DetectionPersonManager ()

@property (nonatomic, strong) AFHTTPRequestOperationManager *netManager;


@end

@implementation DetectionPersonManager

+(instancetype)shareManager{
    static DetectionPersonManager *manager;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        manager = [[DetectionPersonManager alloc] init];
    });
    
    return manager;
}

-(instancetype)init{
    self = [super init];
    if (self) {
        self.netManager = [AFHTTPRequestOperationManager manager];
        
        self.api_key = [KUSER_DEFAULT valueForKey:KAPIKEY];
        self.api_secret = [KUSER_DEFAULT valueForKey:KAPISECRET];
        self.hostAPI = [KUSER_DEFAULT valueForKey:KSERVER];
        self.ldDebug = [KUSER_DEFAULT boolForKey:KDEBUG];
        self.showImages = [KUSER_DEFAULT boolForKey:KSHOWIMAGE];
        
        if (_hostAPI == nil) {
            self.hostAPI = KDEFAULTHOSTAPI;
        }
        if (_api_key == nil || _api_secret == nil) {
            _api_key = KDEFAULTAPIKEY, _api_secret = KDEFAULTAPISECRET;
        }
    }
    return self;
}

-(void)setFinishCheck:(BOOL)finishCheck{
    _finishCheck = finishCheck;
    
    [KUSER_DEFAULT setBool:finishCheck forKey:KFINISHCOMPARE];
    [KUSER_DEFAULT synchronize];
}

-(void)setLdDebug:(BOOL)ldDebug{
    _ldDebug = ldDebug;
    [KUSER_DEFAULT setBool:ldDebug forKey:KDEBUG];
    [KUSER_DEFAULT synchronize];
}
- (void)setShowImages:(BOOL)showImages{
    _showImages = showImages;
    [KUSER_DEFAULT setBool:showImages forKey:KSHOWIMAGE];
    [KUSER_DEFAULT synchronize];
}


- (BOOL)setApi_key:(NSString *)api_key apiSelect:(NSString *)select{
    if (api_key.length == 0 || select.length == 0) {
        return NO;
    }
    _api_key = api_key;
    _api_secret = select;
    
    [KUSER_DEFAULT setValue:api_key forKey:KAPIKEY];
    [KUSER_DEFAULT setValue:select forKey:KAPISECRET];
    [KUSER_DEFAULT synchronize];
    return YES;
}
- (void)setHostAPI:(NSString *)hostAPI{
    if (hostAPI == nil) {
        return;
    }
    if (![[hostAPI lowercaseString] hasPrefix:@"http"]) {
        hostAPI = [NSString stringWithFormat:@"http://%@", hostAPI];
    }
    _hostAPI = hostAPI;
    
    [KUSER_DEFAULT setValue:hostAPI forKey:KSERVER];
    [KUSER_DEFAULT synchronize];
}


- (NSString *)getSaveMovieName{
    NSString *tempName = nil;
    
    if (self.userId) {
        tempName = [NSString stringWithFormat:@"%@-%@",self.userId, [[NSDate date] stringForTimesTampWithS]];
    }else{
        tempName = [[NSDate date] stringForTimesTampWithS];
    }
    
    return tempName;
}

- (void)removeAllPhoto{
    [self.photoArray removeAllObjects];
    self.photoArray = nil;
}

- (void)postImage:(VoidBlock_id)finsh{
    NSString *hostapi = [NSString stringWithFormat:@"%@/person/verify?api_key=%@&api_secret=%@&person_name=%@",self.hostAPI ,_api_key, _api_secret, self.userId];
    NSString *unicodeStr =  [hostapi stringByAddingPercentEscapesUsingEncoding: NSUTF8StringEncoding];
    
    [self.netManager POST:unicodeStr
               parameters:nil
constructingBodyWithBlock:^(id<AFMultipartFormData> formData) {
    NSInteger imgCount = 1;
    for (MGLivenessDetectionFrame *userinfo in self.photoArray) {
        
        UIImage *image = userinfo.croppedImageOfFace;
        NSData *data = UIImageJPEGRepresentation(image, 0.3);
        NSString *stringname = [NSString stringWithFormat:@"img%zi", imgCount];
        NSString *string = [NSString stringWithFormat:@"img%zi.jpg", imgCount];
        
        [formData appendPartWithFileData:data name:stringname fileName:string mimeType:@"image/jpeg"];
    }
}
                  success:^(AFHTTPRequestOperation *operation, id responseObject) {
                      NSDictionary *dic = responseObject;
                      
                      if (finsh) {
                          finsh(dic);
                      }
                  }
                  failure:^(AFHTTPRequestOperation *operation, NSError *error) {
                      NSLog(@"error:%@", error);
                      
                      if (finsh) {
                          finsh(nil);
                      }
                  }];
}

- (void)getAllUser{
    NSString *hostapi = [NSString stringWithFormat:@"%@/person/get_list?api_key=%@&api_secret=%@",self.hostAPI ,_api_key, _api_secret];
    
    AFHTTPRequestOperationManager *manager = [AFHTTPRequestOperationManager manager];
    
    [manager GET:hostapi parameters:nil success:^(AFHTTPRequestOperation *operation, id responseObject) {
        NSLog(@"%@", responseObject);
    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
        NSLog(@"%@", error);
    }];
}

- (void)registerPerson:(UIImage *)personImage username:(NSString *)name finsh:(VoidBlock_id)finsh{
    NSData *imageData = UIImageJPEGRepresentation(personImage, 0.3);
    NSString *hostapi = [NSString stringWithFormat:@"%@/person/create?api_key=%@&api_secret=%@&person_name=%@",self.hostAPI , _api_key, _api_secret, name];
    NSString *unicodeStr =  [hostapi stringByAddingPercentEscapesUsingEncoding: NSUTF8StringEncoding];
    [self.netManager POST:unicodeStr
               parameters:nil
constructingBodyWithBlock:^(id<AFMultipartFormData> formData) {
    [formData appendPartWithFileData:imageData name:@"img" fileName:@"" mimeType:@"image/jpeg"];
}
                  success:^(AFHTTPRequestOperation *operation, id responseObject) {
                      if (finsh) {
                          finsh(responseObject);
                      }
                  }
                  failure:^(AFHTTPRequestOperation *operation, NSError *error) {
                      if (finsh) {
                          finsh(error);
                      }
                  }];
}
- (void)searchPerson:(NSString *)name finsh:(VoidBlock_id)finsh{
    
    NSString *hostapi = [NSString stringWithFormat:@"%@/person/get_info?api_key=%@&api_secret=%@&person_name=%@",self.hostAPI , _api_key, _api_secret, name];
    NSString *unicodeStr =  [hostapi stringByAddingPercentEscapesUsingEncoding: NSUTF8StringEncoding];
    [self.netManager POST:unicodeStr
               parameters:nil
                  success:^(AFHTTPRequestOperation *operation, id responseObject) {
                      if (finsh) {
                          finsh(responseObject);
                      }
                  }
                  failure:^(AFHTTPRequestOperation *operation, NSError *error) {
                      if (finsh) {
                          finsh(error);
                      }
                  }];
}
- (void)featureWithImage:(UIImage *)image finsh:(VoidBlock_id)finsh{
    NSString *API = [NSString stringWithFormat:@"%@/face/extract", KDEFAULTHOSTAPI];
    NSDictionary *dic = @{@"api_key":KDEFAULTAPIKEY, @"api_secret":KDEFAULTAPISECRET};
    NSData *imageData = UIImageJPEGRepresentation(image, 0.2);
    
    [self.netManager POST:API
               parameters:dic
constructingBodyWithBlock:^(id<AFMultipartFormData> formData) {
    [formData appendPartWithFileData:imageData name:@"img" fileName:@"img" mimeType:@"image/jpeg"];
}
                  success:^(AFHTTPRequestOperation *operation, id responseObject) {
                      if (finsh) {
                          finsh([responseObject valueForKey:@"result"]);
                      }
                  }
                  failure:^(AFHTTPRequestOperation *operation, NSError *error) {
                      if (finsh) {
                          finsh(error);
                      }
                  }];
}

- (void)compareWithFaceArray:(NSArray *)faceArray finsh:(VoidBlock_id)finsh{
    if (faceArray.count != 2) {
        if (finsh) {
            finsh(nil);
        }
        return;
    }
    NSString *API = [NSString stringWithFormat:@"%@/face/compare", KDEFAULTHOSTAPI];
    NSDictionary *dic = @{@"api_key":KDEFAULTAPIKEY, @"api_secret":KDEFAULTAPISECRET,
                          @"feature1":[faceArray[0] valueForKey:@"feature"],
                          @"feature2":[faceArray[1] valueForKey:@"feature"]};
    
    [self.netManager POST:API parameters:dic success:^(AFHTTPRequestOperation *operation, id responseObject) {
        if (finsh) {
            finsh(responseObject);
        }
    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
        if (finsh) {
            finsh(error);
        }
    }];
}

//检查身份证
- (void)checkUserCard:(UIImage *)image finish:(VoidBlock_id)finish{
    NSString *API = [NSString stringWithFormat:@"%@/ocr/idcard", KDEFAULTHOSTAPI];
    NSData *imageData = UIImageJPEGRepresentation(image, 0.3);
    NSDictionary *dic = @{@"api_key":KDEFAULTAPIKEY, @"api_secret":KDEFAULTAPISECRET};
    
    [self.netManager POST:API
               parameters:dic
constructingBodyWithBlock:^(id<AFMultipartFormData> formData) {
    [formData appendPartWithFileData:imageData name:@"img" fileName:@"img" mimeType:@"image/jpeg"];
}
                  success:^(AFHTTPRequestOperation *operation, id responseObject) {
                      if (finish) {
                          finish(responseObject);
                      }
                  }
                  failure:^(AFHTTPRequestOperation *operation, NSError *error) {
                      if (finish) {
                          finish(error);
                      }
                  }];
    
}











@end
