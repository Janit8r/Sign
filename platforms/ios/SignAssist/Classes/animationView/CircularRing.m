//
//  CircularRing.m
//  LivenessDetection
//
//  Created by 张英堂 on 15/1/13.
//  Copyright (c) 2015年 megvii. All rights reserved.
//

#import "CircularRing.h"
#import "YTMacro.h"

@implementation CircularRing

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

- (instancetype)initWithFrame:(CGRect)frame{
    self = [super initWithFrame:frame];
    if (self) {
        self.circleLayer = [CAShapeLayer layer];
        self.bottomView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"icon-3"]];
        self.backgroundColor = [UIColor clearColor];
        
        CGFloat lineWidth = 3.f;
        CGFloat radius = CGRectGetWidth(self.bounds)/2 - lineWidth;

        CGRect rect = CGRectMake(lineWidth, lineWidth, radius * 2, radius * 2);
        self.circleLayer.path = [UIBezierPath bezierPathWithRoundedRect:rect
                                                           cornerRadius:radius].CGPath;
        
        self.circleLayer.strokeColor = [UIColor ytColorWithRed:68 green:183 blue:200 alpha:1].CGColor;
        self.circleLayer.fillColor = [UIColor clearColor].CGColor;
        self.circleLayer.lineWidth = lineWidth;
        self.circleLayer.lineCap = kCALineCapRound;
        self.circleLayer.lineJoin = kCALineJoinRound;
        self.circleLayer.strokeEnd = 1;

        rect = CGRectMake((frame.size.width - radius*2)/2, (frame.size.width - radius*2)/2, radius * 2, radius * 2);
        [self.bottomView setFrame:rect];
        
        self.numLabel = [[UILabel alloc] initWithFrame:self.bounds];
        [self.numLabel setTextAlignment:NSTextAlignmentCenter];
        [self.numLabel setFont:[UIFont systemFontOfSize:25]];
        [self.numLabel setTextColor:[UIColor whiteColor]];
        
        [self addSubview:self.bottomView];
        [self.layer addSublayer:self.circleLayer];
        [self addSubview:self.numLabel];

        [self setHidden:YES];
    }
    return self;
}

- (void)setMaxTime:(CGFloat)time{
    
    [self.timer invalidate];
    self.timer = nil;
    
    [self reast];
    _maxTime = time;
    
    [self.circleLayer removeAllAnimations];
}

- (void)startAnimation{
    [self setHidden:NO];
    
    if (self.timer == nil) {
        self.timer = [NSTimer timerWithTimeInterval:1 target:self selector:@selector(timeChange) userInfo:nil repeats:YES];
        [[NSRunLoop currentRunLoop] addTimer:self.timer forMode:NSDefaultRunLoopMode];
    }
    
    [self.timer fire];
    _count = 0;

    if (_maxTime == 0) {
        
    }else{
        self.circleLayer.strokeEnd = 0;
        
        // Configure animation
        CABasicAnimation *drawAnimation = [CABasicAnimation animationWithKeyPath:@"strokeEnd"];
        drawAnimation.duration            = _maxTime; // "animate over 10 seconds or so.."
        drawAnimation.removedOnCompletion = NO;   // Remain stroked after the animation..
        
        // Animate from no part of the stroke being drawn to the entire stroke being drawn
        drawAnimation.fromValue = [NSNumber numberWithFloat:1.0f];
        drawAnimation.toValue   = [NSNumber numberWithFloat:0.0f];
        
        // Experiment with timing to get the appearence to look the way you want
        //    drawAnimation.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseIn];
        // Add the animation to the circle
        [self.circleLayer addAnimation:drawAnimation forKey:@"drawCircleAnimation"];
    }
    
}

- (void)stopAnimation{
    [self.circleLayer removeAllAnimations];
}

- (void)timeChange{
    _count++;
    
    NSInteger num = _maxTime - _count;
    [self.numLabel setText:[NSString stringWithFormat:@"%ld", (long)num]];
    
    
    if (_count == 9) {
        [self.timer invalidate];
        self.timer = nil;
    }
}

- (void)reast{
    
    self.circleLayer.strokeEnd = 1;
}

@end
