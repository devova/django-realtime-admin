from pkg_resources import get_distribution, DistributionNotFound
try:
    __version__ = get_distribution(__name__).version
except DistributionNotFound:
    # package is not installed
    pass

from django_realtime_admin.main import RealTimeModelAdmin

__all__ = ['RealTimeModelAdmin']
