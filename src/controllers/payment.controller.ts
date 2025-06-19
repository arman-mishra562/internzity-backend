import { Request, Response } from 'express';
import { paymentService, PaymentError } from '../services/payment.service';

// STRIPE PAYMENT METHODS
export const createStripePaymentIntent = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = (req as any).user.id;

    const result = await paymentService.createStripePaymentIntent(courseId, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

export const confirmStripePayment = async (req: Request, res: Response) => {
  try {
    const { transactionId, paymentIntentId } = req.body;

    const result = await paymentService.confirmStripePayment(transactionId, paymentIntentId);
    res.json({
      success: true,
      data: {
        transaction: result.transaction,
        enrollment: result.enrollment,
      },
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

export const createStripePaymentIntentMulti = async (req: Request, res: Response) => {
  try {
    const { courseIds } = req.body;
    const userId = (req as any).user.id;
    const result = await paymentService.createStripePaymentIntentMulti(courseIds, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

export const confirmStripePaymentMulti = async (req: Request, res: Response) => {
  try {
    const { transactionIds, paymentIntentId } = req.body;
    const result = await paymentService.confirmStripePaymentMulti(transactionIds, paymentIntentId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

// PAYPAL PAYMENT METHODS
export const createPayPalOrder = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = (req as any).user.id;

    const result = await paymentService.createPayPalOrder(courseId, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

export const capturePayPalOrder = async (req: Request, res: Response) => {
  try {
    const { transactionId, orderId } = req.body;

    const result = await paymentService.capturePayPalOrder(transactionId, orderId);
    res.json({
      success: true,
      data: {
        transaction: result.transaction,
        enrollment: result.enrollment,
      },
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

export const createPayPalOrderMulti = async (req: Request, res: Response) => {
  try {
    const { courseIds } = req.body;
    const userId = (req as any).user.id;
    const result = await paymentService.createPayPalOrderMulti(courseIds, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

export const capturePayPalOrderMulti = async (req: Request, res: Response) => {
  try {
    const { transactionIds, orderId } = req.body;
    const result = await paymentService.capturePayPalOrderMulti(transactionIds, orderId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

// GOOGLE PAY PAYMENT METHODS
export const processGooglePayPayment = async (req: Request, res: Response) => {
  try {
    const { paymentMethodId, courseId } = req.body;
    const userId = (req as any).user.id;

    const result = await paymentService.processGooglePayPaymentStripe(paymentMethodId, courseId, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

export const processGooglePayPaymentMulti = async (req: Request, res: Response) => {
  try {
    const { paymentMethodId, courseIds } = req.body;
    const userId = (req as any).user.id;
    const result = await paymentService.processGooglePayPaymentStripeMulti(paymentMethodId, courseIds, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

export const confirmGooglePayPaymentMulti = async (req: Request, res: Response) => {
  try {
    const { transactionIds, paymentIntentId } = req.body;
    const result = await paymentService.confirmGooglePayPaymentMulti(transactionIds, paymentIntentId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

// RAZORPAY PAYMENT METHODS
export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = (req as any).user.id;

    const result = await paymentService.createRazorpayOrder(courseId, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

export const captureRazorpayPayment = async (req: Request, res: Response) => {
  try {
    const { transactionId, orderId, paymentId, signature } = req.body;

    const result = await paymentService.captureRazorpayPayment(transactionId, orderId, paymentId, signature);
    res.json({
      success: true,
      data: {
        transaction: result.transaction,
        enrollment: result.enrollment,
      },
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

export const createRazorpayOrderMulti = async (req: Request, res: Response) => {
  try {
    const { courseIds } = req.body;
    const userId = (req as any).user.id;
    const result = await paymentService.createRazorpayOrderMulti(courseIds, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

export const captureRazorpayPaymentMulti = async (req: Request, res: Response) => {
  try {
    const { transactionIds, orderId, paymentId, signature } = req.body;
    const result = await paymentService.captureRazorpayPaymentMulti(transactionIds, orderId, paymentId, signature);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

// UTILITY METHODS
export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    const transaction = await paymentService.getTransactionById(transactionId);
    if (!transaction) {
      res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
      return;
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const getUserTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const transactions = await paymentService.getUserTransactions(userId);
    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const refundTransaction = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    const result = await paymentService.refundTransaction(transactionId, reason);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof PaymentError) {
      res.status(400).json({
        success: false,
        error: error.message,
        status: error.status,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};
