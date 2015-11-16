//
//  liveness.h
//  liveness
//
//  Created by youmu on 15-1-6.
//  Copyright (c) 2015年 Megvii Inc. All rights reserved.
//

/*!
 *  \file LivenessDetector.h
 */


#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import "LivenessEnumType.h"

/*!
 *  人脸属性
 */
struct MGFaceAttr {
    /** 是否包含人脸 */
    bool has_face = false;
    /** 左右旋转角度 */
    float yaw = 0;
    /** 上下旋转角度 */
    float pitch = 0;
    /** 运动模糊程度 */
    float blurness_motion = 0;
    /** 高斯模糊程度 */
    float blurness_gaussian = 0;
    /** 人脸位置 */
    CGRect face_rect;
    /** 左眼睁闭程度 */
    float eye_left_hwratio = 0;
    /** 右眼睁闭程度 */
    float eye_right_hwratio = 0;
    /** 嘴部睁闭程度 */
    float mouth_hwratio = 0;
    /** 眼镜判定 */
    float glasses = 0;
    /** 亮度 */
    float brightness = 0;
    /** 人脸有效面积比 */
    float integrity = 0;
    /** 当前帧的属性状态 */
    MGLivenessFrameType frame_type = FRAME_TYPE_NONE;
    /** 连续性检测 */
    bool not_video = false;
    /** 平滑左右旋转角度 */
    float smooth_yaw = 0;
    /** 平滑上下旋转角度 */
    float smooth_pitch = 0;
    /** 眨眼判断 */
    bool eye_blink = false;
    /** 张嘴判断 */
    bool mouth_open = false;
    /** 是否通过3D验证 */
    bool pitch3d = false;
    /** 综合图片质量 */
    float quality = 0;
};

/*!
 *  单帧检测结果的类，包含单帧检测出人脸的所有属性，此类无需构造，仅用于回调
 */
@interface MGLivenessDetectionFrame : NSObject

/** 检测帧对应图片*/
@property (readonly) UIImage* image;

/** 图片中的人脸属性 */
@property (readonly) MGFaceAttr attr;

-(NSComparisonResult) compare: (MGLivenessDetectionFrame*) aFrame;
-(id) duplicate;

/** 根据人脸位置裁剪仅包含人脸的图片 */
-(UIImage*) croppedImageOfFace;
-(MGLivenessDetectionFrame*) croppedFrameOfFaceWithMaxImageSize: (int) maxImageSize;
/** 人脸图片的校验码 */
-(NSString*) checksum;
/** 根据YAW/PITCH获取转换二维坐标，当人脸不存在时不保证返回值有意义 */
+(CGPoint) get2DPointWithMinPitch:(float)minPitch andMaxPitch:(float) maxPitch andMinYaw:(float) minYaw
                        andMaxYaw:(float) maxYaw andCurPitch:(float) curPitch andCurYaw:(float) curYaw;
-(CGPoint) get2DPointWithMinPitch:(float)minPitch andMaxPitch:(float) maxPitch andMinYaw:(float) minYaw
                        andMaxYaw:(float) maxYaw;
-(CGPoint) get2DPoint;
/** 判断二维坐标合法性 */
+(bool) isValid2DPoint:(CGPoint)point;

@end


/*!
 *  此接口通过 MGLivenessDetector 的 setDelegate 函数进行注册，在活体检测的过程中会经由不同的事件触发不同的回调方法
 */
@protocol MGLivenessProtocolDelegate <NSObject>

@required
/*!
 *  当前活体检测的动作检测失败时，调用此方法。
 *  
 *  @param failedType 动作检测失败的原因（具体选项请参照MGLivenessDetectionFailedType）
 *  @return 无
 */
-(void)onDetectionFailed:(MGLivenessDetectionFailedType)failedType;

/*!
 *  当前活体检测的动作检测成功时，调用此方法。
 *  @param validFrame 当前动作中采集的质量最好帧。
 *  @return 下一个需要进行检测的动作的枚举类型（具体选项请参照MGLivenessDetectionType），如果需要结束活体检测流程，则返回类型DETECTION_TYPE_DONE
 */
-(MGLivenessDetectionType)onDetectionSuccess:(MGLivenessDetectionFrame *)validFrame;

/*!
 *  每检测一帧图像，都会调用一次此函数。
 *  @param frame 检测到的人脸的相关信息。
 *  @param timeout 剩余的超时时间
 *  @return 无
 */
-(void)onFrameDetected:(MGLivenessDetectionFrame *)frame andTimeout:(float) timeout;

@end

/*!
 *  活体检测器类，所有活体动作的检测均由此检测器完成
 */
@interface MGLivenessDetector : NSObject

/** 回调接口 */
@property (nonatomic, assign) id <MGLivenessProtocolDelegate> delegate;

/*!
 *  检测器的构造函数，对于所有检测请求默认使用 DISPATCH_QUEUE_PRIORITY_DEFAULT 队列进行异步调用
 *  
 *  @param options 包含构造检测器的各种配置，具体选项请参照 @link DetectorOptionKeys "检测器配置选项"@endlink
 *  @return 根据配置生成的新检测器，若初始化失败，则返回nil
 */
+(MGLivenessDetector*) detectorOfOptions: (NSDictionary*) options;

/*!
 *  检测器的构造函数
 *
 *  @param options 包含构造检测器的各种参数，具体选项请参照 @link DetectorOptionKeys "检测器配置选项"@endlink
 *  @param queue 检测请求的异步执行队列
 *  @return 根据配置生成的新检测器，若初始化失败，则返回nil
 */
+(MGLivenessDetector*) detectorOfOptions: (NSDictionary*) options andDispatchQueue: (dispatch_queue_t) queue;

/*!
 *  更新检测器参数
 *
 *  @param options 包含构造检测器的各种参数，具体选项请参照 @link DetectorOptionKeys "检测器配置选项"@endlink
 *  @return 无
 */
-(void) setOptions: (NSDictionary*) options;

/*!
 *  将视频流获取的原始数据传入检测器进行异步活体检测，检测结果将以异步的形式通知delegate
 *
 *  @param imgBuffer AVCaptureOutput获取的原始数据流，RGB格式
 *  @param orientation 手机朝向，用于旋转/翻转图像
 *  @return 请求是否成功
 */
-(bool) detectWithBuffer: (CMSampleBufferRef) imgBuffer orientation:(UIImageOrientation) orientation;

/*!
 *  将视频流获取的原始数据传入检测器进行异步活体检测，检测结果将以异步的形式通知delegate
 *
 *  @param image 待检测图片，不需要事先旋转/翻转，图片的orientation信息将被用于旋转/翻转图像
 *  @return 请求是否成功
 */
-(bool) detectWithImage: (UIImage*) image;

/*!
 *  强制更改当前的活体检测类型，在调用reset方法后必须调用一次该方法后才会进行活体检测，否则delegate的onDetectionSuccess将不会被触发
 *  
 *  @param detectionType 活体检测类型，具体选项请参照 MGLivenessDetectionType
 *  @return 无
 */
-(void) changeDetectionType:(MGLivenessDetectionType)detectionType;

/*!
 *  当活体检测结束后获得过程中间采集的高质量图片样本
 *  
 *  @return 活体检测过程中，每个动作产生一张人脸。其中如果一个动作过程中有质量合格的人脸，则输出质量合格的。否则就输出质量相对最好的一张。
 */
-(NSArray*) getValidFrame;

/*!
 *  重置Detector类的状态，当用户需要重新开始活体检测流程时，需要调用此函数。
 *
 *  @return 无
 */
-(void) reset;

/*!
 *  获取算法日志（如有需要可调用）
 *
 *  @return 活体检测算法日志
 */
-(NSString*) getAlgorithmLog;

/*!
 *  获取版本信息
 *
 *  @return 版本描述
 */
+(NSString*) getVersion;

@end

