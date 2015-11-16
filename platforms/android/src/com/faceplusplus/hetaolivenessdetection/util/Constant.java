
package com.faceplusplus.hetaolivenessdetection.util;

import com.faceplusplus.hetaolivenessdetection.bean.SFZBean;

import android.os.Environment;


public class Constant {

    public static final String KEY_NAME = "name";
    public static final String KEY_FACEID = "faceid";
    public static final String KEY_APP_TYPE = "key_app_type";
    public static final String KEY_HOSTEDIT = "key_hostedit";
    public static final String KEY_KEYEDIT = "key_keyedit";
    public static final String KEY_SECRETEDIT = "key_secretedit";
    public static final String KEY_ISDEBUG = "key_isdebug";
    public static final String KEY_QRCODEDATA = "key_qrcodedata";
    public static final String KEY_PERSONNAME = "key_personname";
    
    public static String cacheText = "livenessdetection_text";
    public static String cacheImage = "livenessdetection_image";
    public static String cacheCampareImage = "livenessdetection_campareimage";
    public static String dirName = Environment.getExternalStorageDirectory().getAbsolutePath() + "/faceapp";

    // 控制线程池中的线程数量
    public static final int POOL_THREADS_COUNT = 6;
    // 网络连接点
    public static int http_type = 0;
    
    public static SFZBean SFZ_BEAN;

    
}
